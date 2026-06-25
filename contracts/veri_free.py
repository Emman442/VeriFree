# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
from dataclasses import dataclass
import re


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass
    class Write:
        pass


@allow_storage
@dataclass
class UserProfile:
    username: str
    bio: str
    role: str
    reputation_score: str
    jobs_completed: str
    active_jobs: str
    total_earned: str
    total_spent: str
    success_rate: str
    joined_at: str


@allow_storage
@dataclass
class Job:
    job_id: str
    title: str
    description: str
    category: str
    client: str
    freelancer: str
    escrow_amount: str      # stored in GEN (whole units, not wei)
    deadline: str
    is_public: bool
    status: str
    deliverable_url: str
    deliverable_note: str
    ai_verdict: str
    ai_reasoning: str
    submitted_at: str
    completed_at: str
    created_at: str
    ai_auto_assigned: bool
    ai_assignment_reason: str


@allow_storage
@dataclass
class Application:
    job_id: str
    applicant: str
    cover_note: str
    status: str
    applied_at: str
    ai_score: str
    ai_recommendation: str


@allow_storage
@dataclass
class Milestone:
    milestone_id: str
    job_id: str
    title: str
    status: str
    deliverable_url: str
    ai_verdict: str
    ai_reasoning: str


@allow_storage
@dataclass
class Dispute:
    job_id: str
    context_url: str
    explanation: str
    verdict: str
    reasoning: str
    raised_at: str


@allow_storage
class VeriFree(gl.Contract):

    # Core
    jobs: TreeMap[str, Job]
    user_profiles: TreeMap[Address, UserProfile]
    job_ids: DynArray[str]

    # Applications
    applications: TreeMap[str, Application]
    application_ids: DynArray[str]

    # Milestones
    milestones: TreeMap[str, Milestone]
    milestone_ids: DynArray[str]
    job_milestones: TreeMap[str, DynArray[str]]

    # Disputes
    disputes: TreeMap[str, Dispute]

    def __init__(self):
        pass

    # ==================== HELPERS ====================

    def _application_key(self, job_id: str, applicant: str) -> str:
        return job_id + "|" + applicant

    def _clean_url(self, url: str) -> str:
        url = url.strip().replace("\\", "")
        url = url.split(" ")[0].strip()
        url = url.split("\n")[0].strip()
        return url

    def _safe_decode(self, resp) -> str:
        try:
            return resp.body.decode("utf-8", errors="ignore")
        except:
            return ""

    def _classify_url(self, url: str) -> str:
        u = url.lower()
        if "docs.google.com/document" in u:
            return "google_doc"
        if "raw.githubusercontent.com" in u:
            return "github_raw"
        if "github.com" in u:
            return "github"
        if "x.com/" in u or "twitter.com/" in u:
            return "x_post"
        return "generic"

    def _truncate(self, text: str, limit: int = 10000) -> str:
        return text[:limit] if len(text) > limit else text

    def _extract_content(self, url: str) -> str:
        url_type = self._classify_url(url)

        # 1. Define the leader function that fetches data from the web
        def leader_fn() -> str:
            text = ""
            
            if url_type == "google_doc":
                m = re.search(r"/document/d/([^/]+)", url)
                if m:
                    doc_id = m.group(1)
                    export_url = f"https://docs.google.com/document/d/{doc_id}/export?format=txt"
                    try:
                        r = gl.nondet.web.get(export_url)
                        body = self._safe_decode(r)
                        if len(body.strip()) > 80:
                            return body
                    except:
                        pass

            if url_type == "github" and "/blob/" in url:
                raw_url = url.replace("github.com/", "raw.githubusercontent.com/").replace("/blob/", "/")
                try:
                    r = gl.nondet.web.get(raw_url)
                    body = self._safe_decode(r)
                    if len(body.strip()) > 40:
                        return body
                except:
                    pass

            try:
                r = gl.nondet.web.get(url)
                body = self._safe_decode(r)
                if len(body.strip()) > 40:
                    text += body
            except:
                pass

            try:
                rendered = gl.nondet.web.render(url)
                text += "\n[RENDERED]\n" + str(rendered)
            except:
                pass

            return text

        # 2. Define the validator function to reach consensus on the returned data
        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            # If the leader failed or returned an exception, validators must agree on failure
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            
            leader_text = leaders_res.calldata
            
            # The validator executes the same logic independently
            validator_text = leader_fn()
            
            # Decide your consensus threshold. For raw text, you can check if lengths are close,
            # or if it's identical. Web pages can be dynamic, so length matching or essential content
            # presence is usually safer than an exact string match.
            if not leader_text and not validator_text:
                return True
                
            return abs(len(leader_text) - len(validator_text)) <= 500

        # 3. Execute the wrapped block through GenLayer's consensus VM
        return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
    # ==================== PROFILE ====================

    @gl.public.write
    def create_profile(self, username: str, bio: str, role: str) -> None:
        assert role in ["client", "freelancer"], "Role must be client or freelancer"
        address = gl.message.sender_address
        assert address not in self.user_profiles, "Profile already exists"

        self.user_profiles[address] = UserProfile(
            username=username,
            bio=bio,
            role=role,
            reputation_score="100",
            jobs_completed="0",
            active_jobs="0",
            total_earned="0",
            total_spent="0",
            success_rate="100",
            joined_at=gl.message_raw["datetime"]
        )

    @gl.public.view
    def fetch_profile(self, account_address: str) -> UserProfile:
        addr = Address(account_address)
        assert addr in self.user_profiles, "Profile not found"
        return self.user_profiles[addr]

    @gl.public.view
    def profile_exists(self, account_address: str) -> bool:
        addr = Address(account_address)
        return addr in self.user_profiles

    # ==================== JOBS ====================

    @gl.public.write.payable
    def create_job(
        self,
        job_id: str,
        title: str,
        description: str,
        category: str,
        budget: str,
        deadline: str,
        is_public: bool,
        milestone_titles: list[str],
    ) -> None:
        assert job_id not in self.jobs, "Job ID already exists"

        client_address = gl.message.sender_address
        assert client_address in self.user_profiles, "Client profile not found"
        assert self.user_profiles[client_address].role == "client", "Only clients can post jobs"

        budget_int = int(budget)
        assert budget_int > 0, "Budget must be greater than 0"

        # Verify exact GEN amount sent in wei
        expected_wei = u256(budget_int) * u256(10**18)
        assert gl.message.value == expected_wei, "Must send exact budget amount in GEN"

        self.jobs[job_id] = Job(
            job_id=job_id,
            title=title,
            description=description,
            category=category,
            client=client_address.as_hex,
            freelancer="",
            escrow_amount=budget,
            deadline=deadline,
            is_public=is_public,
            status="active",
            deliverable_url="",
            deliverable_note="",
            ai_verdict="",
            ai_reasoning="",
            submitted_at="",
            completed_at="",
            created_at=gl.message_raw["datetime"],
            ai_auto_assigned=False,
            ai_assignment_reason=""
        )

        self.job_ids.append(job_id)

        # Initialize milestone tracking for this job
        self.job_milestones[job_id] = []

        for i in range(len(milestone_titles)):
            milestone_id = job_id + "_ms_" + str(i)

            self.milestones[milestone_id] = Milestone(
                milestone_id=milestone_id,
                job_id=job_id,
                title=milestone_titles[i],
                status="pending",
                deliverable_url="",
                ai_verdict="",
                ai_reasoning=""
            )

            self.milestone_ids.append(milestone_id)
            self.job_milestones[job_id].append(milestone_id)

        current_spent = int(self.user_profiles[client_address].total_spent)
        self.user_profiles[client_address].total_spent = str(current_spent + budget_int)

    @gl.public.view
    def fetch_jobs(self) -> list[Job]:
        result = []
        for job_id in self.job_ids:
            result.append(self.jobs[job_id])
        return result

    @gl.public.view
    def fetch_job_by_id(self, job_id: str) -> Job:
        assert job_id in self.jobs, "Job not found"
        return self.jobs[job_id]

    @gl.public.view
    def get_client_jobs(self, client_address: str) -> list[Job]:
        result = []
        for job_id in self.job_ids:
            if self.jobs[job_id].client.lower() == client_address.lower():
                result.append(self.jobs[job_id])
        return result

    @gl.public.view
    def get_freelancer_jobs(self, freelancer_address: str) -> list[Job]:
        result = []
        for job_id in self.job_ids:
            if self.jobs[job_id].freelancer.lower() == freelancer_address.lower():
                result.append(self.jobs[job_id])
        return result

    @gl.public.view
    def get_freelancer_applications(self, freelancer_address: str) -> list[Application]:
        result = []
        addr = freelancer_address.lower()
        for app_key in self.application_ids:
            app = self.applications[app_key]
            if app.applicant.lower() == addr:
                result.append(app)
        return result

    # ==================== APPLICATIONS ====================

    @gl.public.write
    def apply_for_job(self, job_id: str, cover_note: str) -> None:
        assert job_id in self.jobs, "Job not found"

        job = self.jobs[job_id]
        assert job.is_public, "Job is not public"
        assert job.status == "active", "Job is not accepting applications"

        applicant = gl.message.sender_address.as_hex
        assert applicant.lower() != job.client.lower(), "Client cannot apply to own job"

        if Address(applicant) in self.user_profiles:
            assert self.user_profiles[Address(applicant)].role == "freelancer", "Only freelancers can apply"

        app_key = self._application_key(job_id, applicant)
        assert app_key not in self.applications, "Already applied"

        self.applications[app_key] = Application(
            job_id=job_id,
            applicant=applicant,
            cover_note=cover_note,
            status="pending",
            applied_at=gl.message_raw["datetime"],
            ai_score="0",
            ai_recommendation=""
        )

        self.application_ids.append(app_key)

    @gl.public.view
    def get_applications(self, job_id: str) -> list[Application]:
        result = []
        for app_id in self.application_ids:
            app = self.applications[app_id]
            if app.job_id == job_id:
                result.append(app)
        return result

    @gl.public.write
    def reject_applicant(self, job_id: str, applicant_address: str) -> None:
        assert job_id in self.jobs, "Job not found"
        assert self.jobs[job_id].client == gl.message.sender_address.as_hex, "Not the client"

        app_key = self._application_key(job_id, applicant_address)
        assert app_key in self.applications, "Applicant not found"

        self.applications[app_key].status = "rejected"

    @gl.public.write
    def select_freelancer(self, job_id: str, freelancer_address: str) -> None:
        assert job_id in self.jobs, "Job not found"

        job = self.jobs[job_id]
        assert job.client == gl.message.sender_address.as_hex, "Not the client"
        assert job.status == "active", "Job is not active"

        selected_key = self._application_key(job_id, freelancer_address)
        assert selected_key in self.applications, "Applicant not found"

        self.jobs[job_id].freelancer = freelancer_address
        self.jobs[job_id].status = "in_progress"
        self.applications[selected_key].status = "selected"

        for app_id in self.application_ids:
            app = self.applications[app_id]
            if app.job_id == job_id and app.applicant != freelancer_address:
                self.applications[app_id].status = "rejected"

        freelancer_addr = Address(freelancer_address)
        if freelancer_addr in self.user_profiles:
            current_active = int(self.user_profiles[freelancer_addr].active_jobs)
            self.user_profiles[freelancer_addr].active_jobs = str(current_active + 1)

    # ==================== AI SHORTLIST ====================

    @gl.public.write
    def ai_shortlist_applicants(self, job_id: str) -> str:
        assert job_id in self.jobs, "Job not found"

        job = self.jobs[job_id]
        assert job.client == gl.message.sender_address.as_hex, "Not the client"

        milestone_summary = ""
        milestone_count = 0

        if job_id in self.job_milestones:
            for milestone_id in self.job_milestones[job_id]:
                milestone = self.milestones[milestone_id]
                milestone_summary += "Requirement: " + milestone.title + "\n"
                milestone_count += 1

        assert milestone_count > 0, "No milestones found for this job"

        applicant_summaries = ""
        found_any = False

        for app_id in self.application_ids:
            app = self.applications[app_id]
            if app.job_id == job_id:
                found_any = True
                addr = app.applicant
                profile_data = ""

                if Address(addr) in self.user_profiles:
                    profile = self.user_profiles[Address(addr)]
                    profile_data = (
                        "Reputation Score: " + profile.reputation_score + "\n" +
                        "Jobs Completed: " + profile.jobs_completed + "\n" +
                        "Success Rate: " + profile.success_rate + "%\n"
                    )

                applicant_summaries += (
                    "Applicant: " + addr + "\n" +
                    "Cover Note: " + app.cover_note + "\n" +
                    profile_data +
                    "---\n"
                )

        assert found_any, "No applications yet"

        prompt = f"""
You are evaluating freelancer applications for a freelance job.

JOB TITLE:
{job.title}

JOB DESCRIPTION:
{job.description}

JOB CATEGORY:
{job.category}

JOB REQUIREMENTS / MILESTONES:
{milestone_summary}

APPLICANTS:
{applicant_summaries}

Rank applicants from most to least suitable based on:
1. How well their cover note matches the job description
2. How well they can satisfy the milestone requirements
3. Reputation score
4. Jobs completed
5. Success rate

Return ONLY in this exact format:

RANK: [number]
ADDRESS: [wallet address]
SCORE: [0-100]
REASON: [one sentence]
---
"""

        def nondet():
            return gl.nondet.exec_prompt(prompt)

        result = gl.eq_principle.prompt_comparative(
            nondet,
            principle="Applicants should be ranked by strongest overall fit based on milestone relevance, job description fit, cover note quality, reputation score, completed jobs, and success rate."
        )

        lines = result.split("\n")
        current_address = ""

        for line in lines:
            line = line.strip()
            if line.startswith("ADDRESS:"):
                current_address = line.replace("ADDRESS:", "").strip()
            elif line.startswith("SCORE:") and current_address != "":
                score = line.replace("SCORE:", "").strip()
                app_key = self._application_key(job_id, current_address)
                if app_key in self.applications:
                    self.applications[app_key].ai_score = score
                    self.applications[app_key].status = "shortlisted"
            elif line.startswith("REASON:") and current_address != "":
                reason = line.replace("REASON:", "").strip()
                app_key = self._application_key(job_id, current_address)
                if app_key in self.applications:
                    self.applications[app_key].ai_recommendation = reason

        return result

    # ==================== MILESTONES ====================

    @gl.public.view
    def get_job_milestones(self, job_id: str) -> list[Milestone]:
        result = []
        if job_id in self.job_milestones:
            for milestone_id in self.job_milestones[job_id]:
                result.append(self.milestones[milestone_id])
        return result

    # ==================== DELIVERABLE ====================

    @gl.public.write
    def submit_deliverable(self, job_id: str, proof_url: str, note: str) -> None:
        assert job_id in self.jobs, "Job not found"

        job = self.jobs[job_id]
        assert job.freelancer == gl.message.sender_address.as_hex, "Not the assigned freelancer"
        assert job.status in ["active", "in_progress"], "Job is not active"

        self.jobs[job_id].deliverable_url = proof_url
        self.jobs[job_id].deliverable_note = note
        self.jobs[job_id].status = "pending_review"
        self.jobs[job_id].submitted_at = gl.message_raw["datetime"]

    # ==================== AI VERIFICATION ====================

    @gl.public.write
    def verify_and_pay(self, job_id: str) -> str:
        assert job_id in self.jobs, "Job not found"

        job = self.jobs[job_id]
        assert job.status == "pending_review", "Job is not pending review"
        assert job.deliverable_url != "", "No deliverable submitted"
        assert job.freelancer != "", "No freelancer assigned"
        assert job.client == gl.message.sender_address.as_hex, "Only client can verify and pay"

        milestone_summary = ""
        milestone_count = 0

        if job_id in self.job_milestones:
            for milestone_id in self.job_milestones[job_id]:
                milestone = self.milestones[milestone_id]
                milestone_summary += (
                    "Milestone ID: " + milestone.milestone_id + "\n" +
                    "Checklist Item: " + milestone.title + "\n" +
                    "---\n"
                )
                milestone_count += 1

        assert milestone_count > 0, "No milestones found for this job"

        proof_url = job.deliverable_url
        job_title = job.title
        job_category = job.category
        job_description = job.description
        job_note = job.deliverable_note

        def nondet():
            url = proof_url
            url_type = "generic"
            u = url.lower()
            if "docs.google.com/document" in u:
                url_type = "google_doc"
            elif "raw.githubusercontent.com" in u:
                url_type = "github_raw"
            elif "github.com" in u:
                url_type = "github"
            elif "x.com/" in u or "twitter.com/" in u:
                url_type = "x_post"

            deliverable_content = ""

            if url_type == "google_doc":
                m = re.search(r"/document/d/([^/]+)", url)
                if m:
                    doc_id = m.group(1)
                    export_url = f"https://docs.google.com/document/d/{doc_id}/export?format=txt"
                    try:
                        r = gl.nondet.web.get(export_url)
                        body = r.body.decode("utf-8", errors="ignore")
                        if len(body.strip()) > 80:
                            deliverable_content = body
                    except:
                        pass

            if not deliverable_content and url_type == "github" and "/blob/" in url:
                raw_url = url.replace("github.com/", "raw.githubusercontent.com/").replace("/blob/", "/")
                try:
                    r = gl.nondet.web.get(raw_url)
                    body = r.body.decode("utf-8", errors="ignore")
                    if len(body.strip()) > 40:
                        deliverable_content = body
                except:
                    pass

            if not deliverable_content:
                try:
                    r = gl.nondet.web.get(url)
                    body = r.body.decode("utf-8", errors="ignore")
                    if len(body.strip()) > 40:
                        deliverable_content += body
                except:
                    pass
                try:
                    rendered = gl.nondet.web.render(url)
                    deliverable_content += "\n[RENDERED]\n" + str(rendered)
                except:
                    pass

            deliverable_content = deliverable_content[:12000]

            prompt = f"""
You are a strict but fair freelance job evaluator.

JOB TITLE:
{job_title}

JOB CATEGORY:
{job_category}

JOB DESCRIPTION:
{job_description}

ACCEPTANCE CHECKLIST:
{milestone_summary}

FREELANCER NOTE:
{job_note}

DELIVERABLE URL:
{url}

EXTRACTED DELIVERABLE CONTENT:
{deliverable_content}

Evaluation rules:
1. A deliverable can be a document, article, Google Doc, GitHub file, GitHub repo, X post, landing page, deployed app, or website.
2. If content is accessible and clearly supports the required milestones, count it as verifiable.
3. If the job requires a website or app, evaluate visible evidence of existence, functionality, and requested features.
4. Only evaluate performance claims if there is direct evidence in the content.
5. If even ONE important checklist item is not satisfied, VERDICT must be NO.

Return ONLY in this exact format:

VERDICT: YES or NO
SCORE: [0-100]
REASONING: [2-4 sentences]
MILESTONE_CHECK:
- [milestone_id] | [checklist item] | YES or NO
"""
            return gl.nondet.exec_prompt(prompt)

        result = gl.eq_principle.prompt_comparative(
            nondet,
            principle="The final verdict must only be YES if the deliverable clearly satisfies all checklist items. If any important checklist item is not met, verdict must be NO."
        )

        verdict_passed = "VERDICT: YES" in result.upper()

        self.jobs[job_id].ai_verdict = "passed" if verdict_passed else "failed"
        self.jobs[job_id].ai_reasoning = result
        self.jobs[job_id].completed_at = gl.message_raw["datetime"]

        # Update milestone statuses
        lines = result.split("\n")
        for line in lines:
            line = line.strip()
            if line.startswith("- "):
                cleaned = line[2:]
                parts = cleaned.split("|")
                if len(parts) >= 3:
                    ms_id = parts[0].strip()
                    verdict = parts[2].strip().upper()
                    if ms_id in self.milestones:
                        self.milestones[ms_id].status = "completed" if verdict == "YES" else "rejected"
                        self.milestones[ms_id].ai_verdict = "passed" if verdict == "YES" else "failed"
                        self.milestones[ms_id].ai_reasoning = cleaned

        freelancer_addr = Address(job.freelancer)
        escrow_amount = int(job.escrow_amount)

        if verdict_passed:
            # Pay freelancer in GEN
            payout = u256(escrow_amount) * u256(10**18)
            _Recipient(freelancer_addr).emit_transfer(value=payout)

            self.jobs[job_id].status = "completed"

            if freelancer_addr in self.user_profiles:
                current_completed = int(self.user_profiles[freelancer_addr].jobs_completed)
                current_active = int(self.user_profiles[freelancer_addr].active_jobs)
                current_earned = int(self.user_profiles[freelancer_addr].total_earned)

                self.user_profiles[freelancer_addr].jobs_completed = str(current_completed + 1)
                self.user_profiles[freelancer_addr].active_jobs = str(max(0, current_active - 1))
                self.user_profiles[freelancer_addr].total_earned = str(current_earned + escrow_amount)

        else:
            self.jobs[job_id].status = "revision_requested"

        return result

    # ==================== MILESTONE VERIFICATION ====================

    @gl.public.write
    def verify_milestone(self, job_id: str, milestone_id: str, proof_url: str) -> str:
        assert job_id in self.jobs, "Job not found"
        assert milestone_id in self.milestones, "Milestone not found"

        job = self.jobs[job_id]
        milestone = self.milestones[milestone_id]

        assert milestone.job_id == job_id, "Milestone does not belong to this job"
        assert job.freelancer == gl.message.sender_address.as_hex, "Not the freelancer"
        assert milestone.status == "pending", "Milestone already processed"

        job_title = job.title
        job_description = job.description
        milestone_title = milestone.title
        url = proof_url

        def nondet():
            content = ""
            try:
                r = gl.nondet.web.get(url)
                content = r.body.decode("utf-8", errors="ignore")[:3000]
            except:
                pass

            prompt = f"""
You are checking a single freelance job milestone checklist item.

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

CHECKLIST ITEM:
{milestone_title}

DELIVERABLE CONTENT:
{content}

Return ONLY in this exact format:
VERDICT: YES or NO
REASONING: [2 sentences max]
"""
            return gl.nondet.exec_prompt(prompt)

        result = gl.eq_principle.prompt_comparative(
            nondet,
            principle="The verdict must correctly determine whether the submitted deliverable satisfies this specific acceptance checklist item."
        )

        passed = "VERDICT: YES" in result.upper()

        self.milestones[milestone_id].ai_verdict = "passed" if passed else "failed"
        self.milestones[milestone_id].ai_reasoning = result
        self.milestones[milestone_id].status = "completed" if passed else "rejected"
        self.milestones[milestone_id].deliverable_url = proof_url

        return result

    # ==================== DISPUTES ====================

    @gl.public.write
    def raise_dispute(self, job_id: str, context_url: str, explanation: str) -> str:
        assert job_id in self.jobs, "Job not found"

        job = self.jobs[job_id]
        assert job.freelancer == gl.message.sender_address.as_hex, "Not the freelancer"
        assert job.status == "revision_requested", "Can only dispute revision requests"

        milestone_summary = ""
        milestone_count = 0

        if job_id in self.job_milestones:
            for milestone_id in self.job_milestones[job_id]:
                milestone = self.milestones[milestone_id]
                milestone_summary += (
                    "Milestone ID: " + milestone.milestone_id + "\n" +
                    "Milestone Title: " + milestone.title + "\n" +
                    "Current Status: " + milestone.status + "\n" +
                    "Previous AI Verdict: " + milestone.ai_verdict + "\n" +
                    "Previous AI Reasoning: " + milestone.ai_reasoning + "\n" +
                    "---\n"
                )
                milestone_count += 1

        assert milestone_count > 0, "No milestones found for this job"

        deliverable_url = job.deliverable_url
        previous_reasoning = job.ai_reasoning
        job_title = job.title
        job_description = job.description
        ctx_url = context_url
        expl = explanation

        def nondet():
            original_content = ""
            additional_content = ""

            try:
                r = gl.nondet.web.get(deliverable_url)
                original_content = r.body.decode("utf-8", errors="ignore")[:8000]
            except:
                pass
            try:
                rendered = gl.nondet.web.render(deliverable_url)
                original_content += "\n[RENDERED]\n" + str(rendered)[:4000]
            except:
                pass

            try:
                r2 = gl.nondet.web.get(ctx_url)
                additional_content = r2.body.decode("utf-8", errors="ignore")[:8000]
            except:
                pass
            try:
                rendered2 = gl.nondet.web.render(ctx_url)
                additional_content += "\n[RENDERED]\n" + str(rendered2)[:4000]
            except:
                pass

            prompt = f"""
A freelancer is disputing a failed freelance job verification.

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

MILESTONES TO VERIFY:
{milestone_summary}

ORIGINAL DELIVERABLE CONTENT:
{original_content[:9000]}

FREELANCER EXPLANATION:
{expl}

ADDITIONAL EVIDENCE CONTENT:
{additional_content[:9000]}

PREVIOUS AI REASONING:
{previous_reasoning}

Rules:
1. Re-evaluate using BOTH the original deliverable and new evidence.
2. Accept Google Docs, GitHub files, X posts, websites, and deployed apps as valid evidence if accessible and relevant.
3. Final verdict can only be YES if ALL important milestones are satisfied.

Return ONLY in this exact format:

VERDICT: YES or NO
REASONING: [3 sentences]
MILESTONE_CHECK:
- [milestone_id] | [milestone title] | YES or NO
"""
            return gl.nondet.exec_prompt(prompt)

        result = gl.eq_principle.prompt_comparative(
            nondet,
            principle="The verdict must only be YES if the total evidence clearly shows ALL milestones were completed. Accessible and relevant web evidence should count."
        )

        dispute_passed = "VERDICT: YES" in result.upper()

        self.disputes[job_id] = Dispute(
            job_id=job_id,
            context_url=context_url,
            explanation=explanation,
            verdict="upheld" if dispute_passed else "rejected",
            reasoning=result,
            raised_at=gl.message_raw["datetime"]
        )

        freelancer_addr = Address(job.freelancer)
        escrow_amount = int(job.escrow_amount)

        if dispute_passed:
            # Pay freelancer in GEN
            payout = u256(escrow_amount) * u256(10**18)
            _Recipient(freelancer_addr).emit_transfer(value=payout)

            self.jobs[job_id].status = "completed"
            self.jobs[job_id].completed_at = gl.message_raw["datetime"]

            if freelancer_addr in self.user_profiles:
                current_completed = int(self.user_profiles[freelancer_addr].jobs_completed)
                current_active = int(self.user_profiles[freelancer_addr].active_jobs)
                current_earned = int(self.user_profiles[freelancer_addr].total_earned)

                self.user_profiles[freelancer_addr].jobs_completed = str(current_completed + 1)
                self.user_profiles[freelancer_addr].active_jobs = str(max(0, current_active - 1))
                self.user_profiles[freelancer_addr].total_earned = str(current_earned + escrow_amount)

            # Update milestone statuses from dispute result
            lines = result.split("\n")
            for line in lines:
                line = line.strip()
                if line.startswith("- "):
                    cleaned = line[2:]
                    parts = cleaned.split("|")
                    if len(parts) >= 3:
                        ms_id = parts[0].strip()
                        verdict = parts[2].strip().upper()
                        if ms_id in self.milestones:
                            self.milestones[ms_id].status = "completed" if verdict == "YES" else "rejected"
                            self.milestones[ms_id].ai_verdict = "passed" if verdict == "YES" else "failed"
                            self.milestones[ms_id].ai_reasoning = "Verified during dispute resolution"

        else:
            self.jobs[job_id].status = "dispute_closed"

        return result