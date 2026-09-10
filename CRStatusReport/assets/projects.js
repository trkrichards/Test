// Commercial Readiness Weekly Status Report — shared config
// Edit this file to add/rename/reorder tracked items; both update.html and
// index.html read from here so they always stay in sync.

const EMPLOYEES = ["Kelly", "Barry", "Tessa", "Laura", "Andrew", "Jan"];

// The 5 employees who submit updates via update.html.
// Tessa compiles/hosts the report and can also submit CLH updates herself.
const SUBMITTING_EMPLOYEES = ["Kelly", "Barry", "Laura", "Andrew", "Jan"];

const PROMPT_HINT =
  "Check your Outlook email and calendar, Teams chats, prior status reports, " +
  "and meeting notes from the past 7 days. Write 1\u20134 sentences in third " +
  "person, starting with your name. State what you did and the current " +
  "status \u2014 no filler, no speculation. Leave blank if there\u2019s nothing to report.";

const GROUPS = [
  {
    title: "Physician and Pharmacist Initiatives",
    items: [
      { id: "ck-unified-vision", name: "ClinicalKey Unified Vision (CK+?)" },
      { id: "ckn-unified-vision", name: "ClinicalKey for Nursing Unified Vision (CKN+?)" },
      { id: "ck-physician-bau", name: "ClinicalKey (CK) Physician BAU" },
      { id: "ck-ai-bau", name: "CK AI BAU" },
      { id: "cpck-bau", name: "CPCK BAU" },
      { id: "ck-medical-schools-bau", name: "CK for Medical Schools BAU" },
      { id: "ck-test-prep-bau", name: "CK Test Prep BAU" },
      { id: "neoid-lms-ck-student", name: "NEOID LMS Access CK Student" },
    ],
  },
  {
    title: "Nursing and Patient Education Initiatives",
    items: [
      { id: "clh", name: "Clinical Learning Hub" },
      { id: "ck-student-noam-clinical-cases-bau", name: "CK Student NOAM/Clinical Cases BAU" },
      { id: "ck-nursing-bau", name: "CK Nursing BAU" },
      { id: "patient-pass-pe-products-bau", name: "Patient Pass/PE Products BAU" },
      { id: "clinical-elearning-bau", name: "Clinical eLearning BAU" },
    ],
  },
  {
    title: "Specialist Solution Initiatives",
    items: [
      { id: "clinicalpath-bau", name: "ClinicalPath BAU" },
      { id: "clinicalpath-provider-reports", name: "ClinicalPath Provider Reports" },
      { id: "pss-bau", name: "PSS BAU" },
    ],
  },
  {
    title: "Strategic/Corporate Initiatives",
    items: [
      { id: "elearning-localization", name: "eLearning Localization" },
    ],
  },
];

// Flat lookup: item id -> item name, in canonical report order
const ALL_ITEMS = GROUPS.flatMap((g) => g.items);
