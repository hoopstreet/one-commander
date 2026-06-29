package github.branch_protection

default allow = false

allow {
    input.kind == "Repository"
    input.default_branch == input.branches[_].name
    input.branches[_].protection.required_status_checks.enforce_admins
    input.branches[_].protection.required_pull_request_reviews.required_approving_review_count >= 2
    count(input.branches[_].protection.restrictions.teams) > 0
}

violation[{"msg": msg}] {
    not allow
    msg = sprintf("Branch %s lacks required protection rules", [input.branches[_].name])
}
