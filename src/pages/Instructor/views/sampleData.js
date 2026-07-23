// Sample data for the instructor pages (no backend yet — this is what real data
// would look like once it's wired up).

// The courses shown in the dropdown next to the page title.
export const courses = ['CSCI 2110', 'CSCI 3110', 'CSCI 4171']

// ── Workload page data ──
export const workloadByCourse = {
  'CSCI 2110': {
    heaviestWeek: 'Week 9',
    heaviestNote: 'Heaviest week (A3 + Quiz)',
    peakLoad: 31,
    termAverage: 18,
    recommendedMax: 28,
    insight: 'Three assessments land in Week 9. Moving A3 or the Quiz would cut the peak from 31 h to about 22 h.',
    weeks: [
      { label: 'W1', hours: 8 },
      { label: 'W2', hours: 9 },
      { label: 'W3', hours: 15, marker: 'A1' },
      { label: 'W4', hours: 11 },
      { label: 'W5', hours: 14 },
      { label: 'W6', hours: 22, marker: 'A2' },
      { label: 'W7', hours: 15 },
      { label: 'W8', hours: 18 },
      { label: 'W9', hours: 31, marker: 'A3', peak: true },
      { label: 'W10', hours: 16 },
      { label: 'W11', hours: 14 },
      { label: 'W12', hours: 24, marker: 'Proj' },
      { label: 'W13', hours: 12 },
    ],
  },
  'CSCI 3110': {
    heaviestWeek: 'Week 11',
    heaviestNote: 'Heaviest week (Project demo)',
    peakLoad: 26,
    termAverage: 15,
    recommendedMax: 24,
    insight: 'Week 11 sits just above the recommended max. Spreading the project checkpoints would smooth the load.',
    weeks: [
      { label: 'W1', hours: 6 },
      { label: 'W2', hours: 10 },
      { label: 'W3', hours: 12, marker: 'A1' },
      { label: 'W4', hours: 13 },
      { label: 'W5', hours: 11 },
      { label: 'W6', hours: 18, marker: 'A2' },
      { label: 'W7', hours: 14 },
      { label: 'W8', hours: 16 },
      { label: 'W9', hours: 15 },
      { label: 'W10', hours: 19 },
      { label: 'W11', hours: 26, marker: 'Demo', peak: true },
      { label: 'W12', hours: 17 },
      { label: 'W13', hours: 10 },
    ],
  },
  'CSCI 4171': {
    heaviestWeek: 'Week 7',
    heaviestNote: 'Heaviest week (Midterm + Lab)',
    peakLoad: 23,
    termAverage: 13,
    recommendedMax: 22,
    insight: 'The midterm and a lab overlap in Week 7. Moving the lab to Week 8 keeps every week under the max.',
    weeks: [
      { label: 'W1', hours: 7 },
      { label: 'W2', hours: 8 },
      { label: 'W3', hours: 11, marker: 'Lab1' },
      { label: 'W4', hours: 10 },
      { label: 'W5', hours: 12 },
      { label: 'W6', hours: 14 },
      { label: 'W7', hours: 23, marker: 'Midterm', peak: true },
      { label: 'W8', hours: 13 },
      { label: 'W9', hours: 15, marker: 'Lab2' },
      { label: 'W10', hours: 12 },
      { label: 'W11', hours: 16 },
      { label: 'W12', hours: 18, marker: 'Final proj' },
      { label: 'W13', hours: 9 },
    ],
  },
}

// ── Assignments page data ──
export const assignmentsByCourse = {
  'CSCI 2110': {
    note: '5 assessments · adjust deadlines to balance student workload',
    rows: [
      { id: 'a1', name: 'A1 — Pointers & memory', due: 'Sep 22', hours: 6, avgCompletion: 94, onTime: 91, status: 'Closed' },
      { id: 'a2', name: 'A2 — Linked structures', due: 'Oct 13', hours: 9, avgCompletion: 88, onTime: 84, status: 'Closed' },
      { id: 'a3', name: 'A3 — Graph algorithms', due: 'Nov 3', hours: 15, avgCompletion: 61, onTime: 52, status: 'Open', warning: 'Overlaps the Week-9 peak — projected 52% on-time. Consider moving to Nov 10.' },
      { id: 'quiz2', name: 'Quiz 2', due: 'Nov 5', hours: 3, avgCompletion: null, onTime: null, status: 'Scheduled' },
      { id: 'proj', name: 'Term project', due: 'Nov 24', hours: 12, avgCompletion: null, onTime: null, status: 'Scheduled' },
    ],
  },
  'CSCI 3110': {
    note: '4 assessments · adjust deadlines to balance student workload',
    rows: [
      { id: 'a1', name: 'A1 — Sorting analysis', due: 'Sep 29', hours: 7, avgCompletion: 90, onTime: 87, status: 'Closed' },
      { id: 'a2', name: 'A2 — Dynamic programming', due: 'Oct 20', hours: 10, avgCompletion: 82, onTime: 79, status: 'Open' },
      { id: 'demo', name: 'Project demo', due: 'Nov 12', hours: 14, avgCompletion: null, onTime: null, status: 'Scheduled', warning: 'Lands on the Week-11 peak — projected 68% on-time. Consider moving to Nov 19.' },
      { id: 'final', name: 'Final report', due: 'Dec 1', hours: 9, avgCompletion: null, onTime: null, status: 'Scheduled' },
    ],
  },
  'CSCI 4171': {
    note: '4 assessments · adjust deadlines to balance student workload',
    rows: [
      { id: 'lab1', name: 'Lab 1 — Sockets', due: 'Sep 24', hours: 5, avgCompletion: 92, onTime: 90, status: 'Closed' },
      { id: 'mid', name: 'Midterm', due: 'Oct 22', hours: 8, avgCompletion: 76, onTime: 71, status: 'Open', warning: 'Overlaps a lab in Week 7. Moving the lab to Week 8 keeps on-time above 80%.' },
      { id: 'lab2', name: 'Lab 2 — Routing', due: 'Nov 7', hours: 6, avgCompletion: null, onTime: null, status: 'Scheduled' },
      { id: 'proj', name: 'Final project', due: 'Nov 28', hours: 13, avgCompletion: null, onTime: null, status: 'Scheduled' },
    ],
  },
}
