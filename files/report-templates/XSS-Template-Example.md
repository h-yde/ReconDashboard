# Stored XSS in {{target domain}} via user signature. 

Hey there, while testing your program I came across a XSS vulnerability in the forum by abusing the user’s signature.

###### Reproduction Steps

1. Visit {{target domain}} and login to your account
2. Click on the “account” menu and click on “Profile”
3. Scroll down and insert <script>alert(document.domain)</script> as your signature and click save.
4. Visit the forum and make a new post with title as “XSS TEST” and The body as “TESTING FOR XSS”
5. Once you create a new thread, the xss should trigger.

###### Exploitability

Since the attacker’s post is publicly accessible, this vulnerability could affect all users on the given subdomain. Furthermore, this could be used to perform actions against the administrators (or any user visiting that page) and could potentially lead to hijacking the user’s session/token. This could happen by users navigating to the attacker’s post on their own, or by the attacker somehow persuading the victim to navigate to the post.

###### Impact

Hijacking an administrator’s session would allow an attacker to perform actions such as: edit or deleting content, posing as the admin to socially engineer other users, or any other actions the admin has access to.

The example above has five key items to help the engineer/analyst to triage the given issue:

* The vulnerable domain
* Reproduction steps
* Attack vector/payload
* Exploitability
* Impact

