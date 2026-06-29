package github.codeowners

allow {
    input.path == ".github/CODEOWNERS"
    contains(input.content, "@security-admins")
    contains(input.content, "@platform-admins")
}

violation[{"msg": msg}] {
    not allow
    input.path == ".github/CODEOWNERS"
    msg = "CODEOWNERS must include security-admins and platform-admins"
}
