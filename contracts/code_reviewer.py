# { "Depends": "py-genlayer:latest" }
from genlayer import *
from dataclasses import dataclass


@allow_storage
@dataclass
class Review:
    code_snippet: str
    language: str
    submitter: Address
    overall_score: u8          # 0-10
    bugs_found: str            # JSON list as string
    suggestions: str           # JSON list as string
    security_issues: str       # JSON list as string
    summary: str


class CodeReviewer(gl.Contract):
    """
    AI-powered code review using GenLayer consensus.

    User submits a code snippet, and multiple AI validators agree
    on a structured review. Results are stored on-chain.
    """

    reviews: TreeMap[u256, Review]
    total_reviews: u256

    def __init__(self):
        self.total_reviews = u256(0)

    # ═══════════════════════════════════════════════════════════
    # MAIN FUNCTION: Submit code for review
    # ═══════════════════════════════════════════════════════════
    @gl.public.write
    def submit_code(self, code: str, language: str) -> u256:
        """
        User submits code → AI validators review it → Result stored on-chain.

        Args:
            code: The code snippet to review
            language: Programming language (python, javascript, etc.)

        Returns:
            review_id: ID of the created review
        """
        if len(code) == 0:
            raise gl.vm.UserError("Code cannot be empty")

        if len(code) > 10000:
            raise gl.vm.UserError("Code too long (max 10000 chars)")

        # ─────────────────────────────────────────────────────
        # AI REVIEW FUNCTION (runs in non-deterministic block)
        # ─────────────────────────────────────────────────────
        def review_code():
            prompt = f"""
You are an expert code reviewer. Review the following {language} code.

CODE:
```{language}
{code}
```

Provide a structured review. Return ONLY valid JSON in this exact format:

{{
    "overall_score": <integer 0-10>,
    "summary": "<one sentence overall assessment>",
    "bugs": ["<bug 1>", "<bug 2>"],
    "suggestions": ["<improvement 1>", "<improvement 2>"],
    "security_issues": ["<issue 1>", "<issue 2>"]
}}

Rules:
- overall_score: 0 = terrible, 10 = excellent
- Each list can be empty [] if nothing to report
- Keep each item under 100 characters
- Be specific and actionable
"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")

            # Validate structure
            if not isinstance(result, dict):
                raise gl.vm.UserError("AI returned invalid format")

            required_keys = ["overall_score", "summary", "bugs", "suggestions", "security_issues"]
            for key in required_keys:
                if key not in result:
                    raise gl.vm.UserError(f"AI missing field: {key}")

            # Normalize score to 0-10
            score = int(result["overall_score"])
            if score < 0:
                score = 0
            if score > 10:
                score = 10
            result["overall_score"] = score

            return result

        # ─────────────────────────────────────────────────────
        # CONSENSUS: Use comparative equivalence
        # Multiple validators must agree on review structure
        # ─────────────────────────────────────────────────────
        review_result = gl.eq_principle.prompt_comparative(
            review_code,
            principle=(
                "The overall_score must be within 2 points across validators. "
                "The summary and main findings must convey the same meaning, "
                "even if worded differently."
            ),
        )

        # ─────────────────────────────────────────────────────
        # STORE ON-CHAIN
        # ─────────────────────────────────────────────────────
        import json as _json

        review_id = self.total_reviews
        submitter = gl.message.sender_address

        new_review = Review(
            code_snippet=code,
            language=language,
            submitter=submitter,
            overall_score=u8(review_result["overall_score"]),
            bugs_found=_json.dumps(review_result["bugs"]),
            suggestions=_json.dumps(review_result["suggestions"]),
            security_issues=_json.dumps(review_result["security_issues"]),
            summary=review_result["summary"],
        )

        self.reviews[review_id] = new_review
        self.total_reviews = review_id + u256(1)

        return review_id

    # ═══════════════════════════════════════════════════════════
    # VIEW FUNCTIONS (read-only, free to call)
    # ═══════════════════════════════════════════════════════════
    @gl.public.view
    def get_review(self, review_id: u256) -> dict:
        """Get full review details"""
        review = self.reviews.get(review_id)
        if not review:
            return {}

        return {
            "id": str(review_id),
            "code": review.code_snippet,
            "language": review.language,
            "submitter": str(review.submitter),
            "overall_score": int(review.overall_score),
            "summary": review.summary,
            "bugs": review.bugs_found,
            "suggestions": review.suggestions,
            "security_issues": review.security_issues,
        }

    @gl.public.view
    def get_total_reviews(self) -> u256:
        """Total number of reviews submitted"""
        return self.total_reviews

    @gl.public.view
    def get_user_review_count(self, user: str) -> u32:
        """How many reviews a user has submitted (scans all reviews)"""
        addr = Address(user)
        count = 0
        total = int(self.total_reviews)
        for i in range(total):
            review = self.reviews.get(u256(i))
            if review and review.submitter == addr:
                count += 1
        return u32(count)

    @gl.public.view
    def get_recent_reviews(self, limit: u32) -> list:
        """Get last N reviews (newest first)"""
        if self.total_reviews == u256(0):
            return []

        max_limit = int(limit) if int(limit) < 20 else 20
        total = int(self.total_reviews)
        start = max(0, total - max_limit)

        results = []
        for i in range(total - 1, start - 1, -1):
            review = self.reviews.get(u256(i))
            if review:
                results.append({
                    "id": i,
                    "language": review.language,
                    "score": int(review.overall_score),
                    "summary": review.summary,
                })

        return results
