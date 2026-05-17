
let step = 0;
let answers = {};

// ✅ Boroughs
const supportedBoroughs = [
  "Westminster","Camden","Hillingdon","Hounslow",
  "Ealing","Hammersmith and Fulham","Brent","Kensington and Chelsea"
];

const allBoroughs = [
  "Barking and Dagenham","Barnet","Bexley","Brent","Bromley",
  "Camden","Croydon","Ealing","Enfield","Greenwich","Hackney",
  "Hammersmith and Fulham","Haringey","Harrow","Havering",
  "Hillingdon","Hounslow","Islington","Kensington and Chelsea",
  "Kingston upon Thames","Lambeth","Lewisham","Merton","Newham",
  "Redbridge","Richmond upon Thames","Southwark","Sutton",
  "Tower Hamlets","Waltham Forest","Wandsworth","Westminster"
];

// ✅ Progress
function progressUI() {
  const total = 7;
  const percent = Math.round((Math.min(step, total) / total) * 100);

  return `
    <div class="progress-wrapper">
      <div class="progress-text">Step ${Math.min(step, total)} of ${total}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>
    </div>
  `;
}

// ✅ Rejection screen (professional)
function rejection(title, message, extra = "") {
  return `
    <div class="card">

      <h3 class="result-warning">${title}</h3>

      <p>${message}</p>

      ${extra ? `<div class="alert">${extra}</div>` : ""}

      <p class="reassurance">
        Where appropriate, please contact the AngelBox team for further clarification.
      </p>

      <button class="back" onclick="reset()">Start again</button>

    </div>
  `;
}

function render() {
  const el = document.getElementById("app");

  // ✅ FAIL STATES

  if (step === "boroughFail") {
    el.innerHTML = rejection(
      "Outside service area",
      `This referral relates to ${answers.borough}, which is outside current service coverage.`,
      "Please refer to appropriate local services within that borough."
    );
    return;
  }

  if (step === "residencyFail") {
    el.innerHTML = rejection(
      "Residency criteria not met",
      "This residency category may require a higher financial support threshold.",
      "These circumstances may fall outside the eligibility criteria used for AngelBox referrals."
    );
    return;
  }

  if (step === "incomeFail") {
    el.innerHTML = rejection(
      "Income exceeds threshold",
      "AngelBox prioritises households experiencing significant financial hardship."
    );
    return;
  }

  if (step === "directorFail") {
    el.innerHTML = rejection(
      "Unable to assess financial position",
      "Company directors may have complex or variable income structures.",
      "This can include dividends, director loans, or business-funded personal expenses."
    );
    return;
  }

  if (step === "dueDateFail") {
    el.innerHTML = rejection(
      "Application timing",
      "The expected due date is outside the current intake window.",
      "Referrals are typically accepted closer to the due date."
    );
    return;
  }

  if (step === "evidenceFail") {
    el.innerHTML = rejection(
      "Supporting evidence required",
      "Evidence is required to assess eligibility and prioritisation."
    );
    return;
  }

  // ✅ STEP 0 START
  if (step === 0) {
    el.innerHTML = `
      <div class="card">
        <p>
          This tool supports professionals in determining whether a referral meets initial AngelBox eligibility criteria.
        </p>

        <button class="btn primary" onclick="step=1; render()">
          Start eligibility check
        </button>
      </div>`;
  }

  // ✅ STEP 1 Borough
  else if (step === 1) {
    el.innerHTML = `
      <div class="card">
        ${progressUI()}

        <p>Which borough does the applicant reside in?</p>

        <select id="borough">
          <option value="">Select borough</option>
          ${allBoroughs.map(b=>`<option>${b}</option>`).join("")}
        </select>

        <button class="btn primary" onclick="nextBorough()">Continue</button>
        <button class="back" onclick="back()">Go back</button>
      </div>`;
  }

  // ✅ STEP 2 Residency (FIXED + FULL LIST)
  else if (step === 2) {
    el.innerHTML = `
      <div class="card">
        ${progressUI()}

        <p>What is the applicant’s residency status?</p>

        <p class="reassurance">
          Select the most accurate option based on available information.
        </p>

        <select id="residency">
          <option value="">Select</option>

          <option value="uk">UK citizen or settled (ILR)</option>
          <option value="asylum">Asylum seeker or refugee</option>
          <option value="limited">Limited leave to remain</option>

          <option value="student">Student visa</option>
          <option value="visitor">Visitor visa</option>
          <option value="spouse">Spouse / partner visa</option>
          <option value="fiance">Fiancé visa</option>

          <option value="other">Other / unsure</option>
        </select>

        <button class="btn primary" onclick="nextResidency()">Continue</button>
        <button class="back" onclick="back()">Go back</button>
      </div>`;
  }

  // ✅ STEP 3 Employment
  else if (step === 3) {
    el.innerHTML = `
      <div class="card">
        ${progressUI()}

        <p>What is the applicant’s employment status?</p>

        <select id="employment">
          <option value="">Select</option>
          <option>Employed</option>
          <option>Part-time</option>
          <option>Self-employed</option>
          <option>Unemployed</option>
        </select>

        <button class="btn primary" onclick="nextEmployment()">Continue</button>
        <button class="back" onclick="back()">Go back</button>
      </div>`;
  }

  // ✅ STEP 4 Income
  else if (step === 4) {
    el.innerHTML = `
      <div class="card">
        ${progressUI()}

        <p>Does the household income exceed £10,500 per year?</p>

        <button class="btn primary" onclick="handleIncome('no')">No</button>
        <button class="btn secondary" onclick="handleIncome('yes')">Yes</button>

        <button class="back" onclick="back()">Go back</button>
      </div>`;
  }

  // ✅ STEP 5 Director
  else if (step === 5) {
    el.innerHTML = `
      <div class="card">
        ${progressUI()}

        <p>Is the applicant a registered company director?</p>

        <button class="btn primary" onclick="handleDirector('no')">No</button>
        <button class="btn secondary" onclick="handleDirector('yes')">Yes</button>

        <button class="back" onclick="back()">Go back</button>
      </div>`;
  }

  // ✅ STEP 6 Due date
  else if (step === 6) {
    el.innerHTML = `
      <div class="card">
        ${progressUI()}

        <p>What is the baby’s due date (or date of birth)?</p>

        <input type="date" id="dueDate">

        <button class="btn primary" onclick="handleDueDate()">Continue</button>
        <button class="back" onclick="back()">Go back</button>
      </div>`;
  }

  // ✅ STEP 7 Evidence
  else if (step === 7) {
    el.innerHTML = `
      <div class="card">
        ${progressUI()}

        <p>Can the applicant provide supporting evidence if required?</p>

        <button class="btn primary" onclick="handleEvidence('yes')">Yes</button>
        <button class="btn secondary" onclick="handleEvidence('no')">No</button>

        <button class="back" onclick="back()">Go back</button>
      </div>`;
  }

  // ✅ RESULT
  else if (step === 8) {
    el.innerHTML = `
      <div class="card">

        <h3 class="result-success">
          This referral appears to meet initial eligibility criteria
        </h3>

        <p>
          Please proceed with submitting a full referral for assessment.
        </p>

        <div class="alert">
          All referrals are subject to verification and prioritisation.
        </div>

        <p style="font-weight:600;">
          Please scroll down to complete the referral submission
        </p>

        <button class="back" onclick="reset()">Start again</button>
      </div>`;
  }
}

// ✅ HANDLERS

function nextBorough() {
  const val = document.getElementById("borough").value;
  if (!val) return alert("Select a borough");

  answers.borough = val;
  step = supportedBoroughs.includes(val) ? 2 : "boroughFail";
  render();
}

function nextResidency() {
  const val = document.getElementById("residency").value;
  if (!val) return alert("Select residency");

  answers.residency = val;

  const excluded = ["student","visitor","spouse","fiance"];

  step = excluded.includes(val) ? "residencyFail" : 3;

  render();
}

function nextEmployment() {
  step = 4;
  render();
}

function handleIncome(val) {
  step = val === "yes" ? "incomeFail" : 5;
  render();
}

function handleDirector(val) {
  step = val === "yes" ? "directorFail" : 6;
  render();
}

function handleDueDate() {
  const val = document.getElementById("dueDate").value;
  if (!val) return alert("Enter a date");

  const diff = (new Date(val) - new Date()) / (1000 * 60 * 60 * 24);

  step = diff > 60 ? "dueDateFail" : 7;

  render();
}

function handleEvidence(val) {
  step = val === "no" ? "evidenceFail" : 8;
  render();
}

function back() {
  if (typeof step === "number" && step > 0) step--;
  render();
}

function reset() {
  step = 0;
  answers = {};
  render();
}

render();
