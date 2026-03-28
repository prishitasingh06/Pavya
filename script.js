const loginContainer = document.getElementById('loginContainer');
const trackerContainer = document.getElementById('trackerContainer');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('userDisplay');

let currentUser = localStorage.getItem('currentUser');

// Login
loginBtn.addEventListener('click', () => 
{
  const username = document.getElementById('username').value.trim();
  if(!username) return alert("Enter a username");
  localStorage.setItem('currentUser', username);
  currentUser = username;
  showTracker();
});

// Logout
logoutBtn.addEventListener('click', () =>
{
  localStorage.removeItem('currentUser');
  currentUser = null;
  trackerContainer.style.display = 'none';
  loginContainer.style.display = 'block';
  document.getElementById('username').value = '';
});

// Show tracker
function showTracker()
{
  loginContainer.style.display = 'none';
  trackerContainer.style.display = 'block';
  userDisplay.innerText = currentUser;
  renderHistory();
  renderNextPeriodCard();
  renderCalendar();
}

// Add period
document.getElementById('addPeriodBtn').addEventListener('click', () =>
{
  const startDate = document.getElementById('startDate').value;
  const periodLength = parseInt(document.getElementById('cycleLength').value);
  if(!startDate || !periodLength) return alert("Enter valid date and length");

  let users = JSON.parse(localStorage.getItem('users') || "{}");
  if(!users[currentUser]) users[currentUser] = [];
  users[currentUser].push({startDate, periodLength});
  localStorage.setItem('users', JSON.stringify(users));

  renderHistory();
  renderNextPeriodCard();
  renderCalendar();
});

// Render history cards
function renderHistory()
{
  const historyEl = document.getElementById('periodHistory');
  historyEl.innerHTML = '';
  let users = JSON.parse(localStorage.getItem('users') || "{}");
  if(users[currentUser]){
    users[currentUser].forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<strong>${p.startDate}</strong><br>Length: ${p.periodLength} days`;
      historyEl.appendChild(card);
    });
  }
}

// Render next period card
function renderNextPeriodCard(){
  const nextPeriodInfo = document.getElementById('nextPeriodInfo');
  let users = JSON.parse(localStorage.getItem('users') || "{}");
  const periods = users[currentUser];
  if(!periods || periods.length === 0){
    nextPeriodInfo.innerText = "No periods added yet.";
    return;
  }

  const last = periods[periods.length - 1];
  const start = new Date(last.startDate);
  const cycle = 28; // average cycle length
  const nextPeriod = new Date(start.getTime());
  nextPeriod.setDate(start.getDate() + cycle);

  const ovulation = new Date(nextPeriod.getTime());
  ovulation.setDate(nextPeriod.getDate() - 14);

  const fertileStart = new Date(ovulation.getTime());
  fertileStart.setDate(ovulation.getDate() - 5);
  const fertileEnd = ovulation;

  const options = { month:'short', day:'numeric' };
  nextPeriodInfo.innerHTML = `
    <strong>Next Period:</strong> ${nextPeriod.toLocaleDateString(undefined, options)}<br>
    <strong>Ovulation:</strong> ${ovulation.toLocaleDateString(undefined, options)}<br>
    <strong>Fertile Window:</strong> ${fertileStart.toLocaleDateString(undefined, options)} - ${fertileEnd.toLocaleDateString(undefined, options)}
  `;
}

// Render simple calendar with highlights
function renderCalendar()
{
  const calendarEl = document.getElementById('calendar');
  calendarEl.innerHTML = '';
  const today = new Date();
  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const users = JSON.parse(localStorage.getItem('users') || "{}");
  const periods = users[currentUser] || [];

  for(let d=1; d<=endMonth.getDate(); d++){
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    dayEl.innerText = d;

    // Check if this day is in period, fertile window, or ovulation
    periods.forEach(p => 
    {
      const start = new Date(p.startDate);
      for(let i=0;i<p.periodLength;i++)
      {
        const pd = new Date(start.getTime());
        pd.setDate(start.getDate() + i);
        if(pd.toDateString() === new Date(dateStr).toDateString())
        {
          dayEl.classList.add('period');
        }
      }
      // Fertile & ovulation
      const cycle = 28;
      const nextPeriod = new Date(start.getTime());
      nextPeriod.setDate(start.getDate() + cycle);
      const ovulation = new Date(nextPeriod.getTime());
      ovulation.setDate(nextPeriod.getDate() - 14);
      const fertileStart = new Date(ovulation.getTime());
      fertileStart.setDate(ovulation.getDate() - 5);

      for(let i=0;i<=5;i++)
      {
        const fd = new Date(fertileStart.getTime());
        fd.setDate(fertileStart.getDate() + i);
        if(fd.toDateString() === new Date(dateStr).toDateString())
        {
          dayEl.classList.add('fertile');
        }
      }
      if(ovulation.toDateString() === new Date(dateStr).toDateString())
      {
        dayEl.classList.add('ovulation');
      }
    });

    calendarEl.appendChild(dayEl);
  }
}

// Auto-login
if(currentUser)
{
  showTracker();
}