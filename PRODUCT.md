# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- IUH students applying to, or maintaining eligibility in, Cử nhân tài năng (CNTN) and Kỹ sư tài năng (KSTN) programs.
- Lecturers responsible for classes and applicant evaluation.
- Program heads managing admissions, criteria, classes, lecturers, and approvals within a major.
- Faculty leadership overseeing faculty-level programs, criteria, applications, and results.
- Representatives of the Phòng Đào tạo overseeing school-wide records and final approvals.
- System administrators managing academic structures, accounts, permissions, and admission rounds.

The primary job across these roles is to complete and govern the full admissions lifecycle with the correct information, authority, and status visible at each step.

## Product Purpose

IUH Talent is a Vietnamese-language web portal for end-to-end administration of IUH's CNTN and KSTN admissions. It brings student applications, supporting evidence, evaluation criteria, review and approval, results, classes, academic structures, accounts, and permissions into one role-aware workflow.

The current repository is a frontend prototype intended to evolve into a real product. Success means making the admissions process easier to understand and operate for students and university staff while providing a credible foundation for future production integration.

## Positioning

The product combines the public application journey and the university's multi-level academic approval structure in one system. Its differentiating mechanism is role-scoped coordination across student, lecturer, major, faculty, training-office, and administrator responsibilities rather than a generic application form or standalone back-office dashboard.

## Operating Context

- The institutional hierarchy is `Khoa → Ngành → Lớp`.
- A major may contain CNTN/KSTN classes associated with cohorts and academic years.
- Students submit new-admission or continuing-eligibility applications and supporting PDF evidence.
- Staff define admission rounds and evaluation criteria, inspect applications, perform staged approvals, publish or confirm results, and manage resulting class records.
- Permissions and data visibility follow a user's role and organizational scope.
- Interfaces and product terminology are in Vietnamese and must remain legible for university administrative work, including dense tables and multi-step review flows.

## Capabilities and Constraints

- Public discovery of active admission rounds and application submission.
- Authentication and role-specific navigation for students, lecturers, program heads, faculty leadership, Phòng Đào tạo representatives, and administrators.
- Management or scoped viewing of majors, classes, lecturers, students, permissions, admission rounds, criteria, applications, approvals, and results.
- Student maintenance-application updates and supporting-document handling.
- Search, filtering, status display, pagination, and export for administrative records.
- Tables are paginated at a maximum of 10 rows per page in the current product specification.
- Duplicate major records using the same faculty and major name must be rejected.
- A parent academic entity cannot be deleted while dependent child records remain; children must be removed first.
- The current implementation is frontend-only. Backend integration, authentication security, persistent storage, authoritative business rules, and production deployment remain future work.
- The final production source of truth for institutional data and policy is still undecided.

## Brand Commitments

- Preserve the IUH and Khoa Công nghệ Thông tin identity assets already present in the repository unless an authorized rebrand explicitly replaces them.
- Use the established Vietnamese institutional terminology accurately and consistently.
- Future interface work must feel intentional, credible, and specific to this admissions domain. Avoid generic, interchangeable, or visibly AI-generated design patterns and copy.

## Evidence on Hand

- `NGHIEP-VU.md` contains the current business description for academic hierarchy and major-management behavior.
- `DESIGN.md` records the incumbent visual system.
- `assets/img/logo-iuh-khoa-cntt.svg` is the current IUH Faculty of Information Technology identity asset.
- The React prototype in `src/` demonstrates the intended roles, routes, workflows, tables, forms, states, and sample interactions.
- Current personal names, student records, dates, scores, contact details, admission rounds, and other populated records are illustrative demo data. They are not verified institutional facts and must not be represented as real evidence.
- No verified testimonials, production metrics, deployment claims, or institutional approval evidence are currently on hand.

## Product Principles

1. Make authority and responsibility explicit: every role should see the actions, records, and organizational scope it is responsible for.
2. Preserve trust in high-stakes workflows: statuses, requirements, evidence, evaluation, and approvals must be understandable and traceable.
3. Keep the student journey clear while supporting the density required by university administration.
4. Encode the real academic hierarchy and lifecycle instead of flattening the product into generic CRUD screens.
5. Distinguish verified production truth from prototype content; never turn illustrative data into institutional claims.
