import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const timeInput = document.querySelector('#time');
const timeLabel = document.querySelector('#timeLabel');
const submit = document.querySelector('#submit');
const nextDayBtn = document.querySelector('#nextDayBtn');
const resultDisplay = document.querySelector('#result');
const inputGender = document.querySelector('#gender');
const logBtn = document.querySelector('#logBtn');
const logArea = document.querySelector('#logArea');
const summaryArea = document.querySelector('#summaryArea');
const graph = document.querySelector('#graph');

let prevDaysLogHTML;

// Initialize graph 

const width = 400;
const height = 200;
const margin = { top: 20, right: 20, bottom: 20, left: 50 };
const baseline = 110;

const glucoseArray = Array.from({ length: 25 }, (_, hour) => ({
  hour,
  finalScore: baseline
}));

const svg = d3.select("#graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const xScale = d3.scaleLinear()
  .domain([0, 24])
  .range([margin.left, width - margin.right]);

const yScale = d3.scaleLinear()
  .range([height - margin.bottom, margin.top])
  .domain([50, 250]);

const lineGenerator = d3.line()
  .x(d => xScale(d.hour))
  .y(d => yScale(d.finalScore))
  .curve(d3.curveMonotoneX);

const xAxis = svg.append("g")
  .attr("transform", `translate(0, ${height - margin.bottom})`)
  .call(d3.axisBottom(xScale));

const yAxis = svg.append("g")
  .attr("transform", `translate(${margin.left}, 0)`)
  .call(d3.axisLeft(yScale));

const path = svg.append("path")
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2);

renderGraph();

const weights = {
  hour: 0.280645,
  HbA1c: 0.118344,
  total_carb: 0.112520,
  sugar: 0.110247,
  calories: 0.099352,
  protein: 0.090501,
  total_fat: 0.078747,
  dietary_fiber: 0.061027,
  gender: 0.048618,
};

const logData = [];

let currentDay = 1; // track current day for graph & filtering

let numWarnings = 0;

// Slider start at 0 initially
timeInput.value = 0;
timeLabel.textContent = '0';

// Update label when slider moves
timeInput.addEventListener('input', () => {
  timeLabel.textContent = timeInput.value;
});

submit.addEventListener('click', () => {
  const dish = document.querySelector('#dish').value || 'No dish named';
  const calories = parseFloat(document.querySelector('#calories').value) || 0;
  const carbs = parseFloat(document.querySelector('#carbs').value) || 0;
  const dietary_fiber = parseFloat(document.querySelector('#fiber').value) || 0;
  const sugar = parseFloat(document.querySelector('#sugar').value) || 0;
  const total_fat = parseFloat(document.querySelector('#fat').value) || 0;
  const protein = parseFloat(document.querySelector('#protein').value) || 0;
  const Hb1Ac = parseFloat(document.querySelector('#Hb1Ac').value) || 0;
  const hour = parseInt(timeInput.value) || 0;

  const nutrientScore =
    calories * weights.calories +
    carbs * weights.total_carb +
    sugar * weights.sugar +
    protein * weights.protein +
    Hb1Ac * weights.HbA1c +
    hour * weights.hour +
    dietary_fiber * weights.dietary_fiber +
    total_fat * weights.total_fat;

  const finalScore = 110 + nutrientScore + 0 * weights.gender;

  resultDisplay.textContent =
    `Expected Glucose Level: ${finalScore.toFixed(1)}`;

  updateCharacter(finalScore);

  logData.push({
    day: currentDay,
    dish,
    hour,
    calories,
    carbs,
    sugar,
    protein,
    finalScore
  });

  // Reset glucoseArray baseline
  for (let i = 0; i < glucoseArray.length; i++) {
    glucoseArray[i].finalScore = baseline;
  }

  // Update glucoseArray only for current day entries, keeping max finalScore per hour
  logData.filter(entry => entry.day === currentDay).forEach(entry => {
    if (glucoseArray[entry.hour].finalScore < entry.finalScore) {
      glucoseArray[entry.hour].finalScore = entry.finalScore;
    }
  });

  updateLog();
  showSummary();
  renderGraph();
  graph.style.display = 'block';
});

nextDayBtn.addEventListener('click', () => {
  currentDay++;
  
  // Hide the graph until next submit
  graph.style.display = 'none';
  
  // Reset glucoseArray baseline
  for (let i = 0; i < glucoseArray.length; i++) {
    glucoseArray[i].finalScore = baseline;
  }

  // Clear logs and summaries for new day
  showSummary();
  renderGraph(); // You can still render the empty graph if you want

  // Optionally, clear any messages or results
  resultDisplay.textContent = '';

  prevDaysLogHTML = logArea.innerHTML;
});


// Toggle log visibility
let logVisible = false;
logBtn.addEventListener('click', () => {
  logVisible = !logVisible;
  logArea.style.display = logVisible ? 'block' : 'none';
});

function updateLog() {
  const entries = logData
    .filter(entry => entry.day === currentDay)
    .map(entry => {
      const warning = entry.finalScore > 180
        ? `<br><span class="danger">Dangerous glucose spike occurred!</span>`
        : '';
      if (warning) {
        numWarnings++;
      }
      return `
      <div class="log-entry">
        <strong>Day ${entry.day}:</strong><br><br>
        <strong>Dish:</strong> ${entry.dish}<br>
        <strong>Time:</strong> ${entry.hour}:00<br>
        <strong>Calories:</strong> ${entry.calories}<br>
        <strong>Carbs:</strong> ${entry.carbs}g<br>
        <strong>Sugar:</strong> ${entry.sugar}g<br>
        <strong>Protein:</strong> ${entry.protein}g<br>
        <strong>Glucose Level:</strong> ${entry.finalScore.toFixed(1)}
        ${warning}
        <br><br>
      </div>`;
    }).join('');

  logArea.innerHTML = prevDaysLogHTML + `<h3>Meal Log - Day ${currentDay}</h3>${entries}`;
  if (logVisible) logArea.style.display = 'block';
}

function showSummary() {
  if (currentDay % 7 !== 0) return;

  const block = Math.floor(currentDay / 7);
  const startDay = block * 7 - 6;
  const endDay = block * 7;

  const blockEntries = logData.filter(entry => entry.day >= startDay && entry.day <= endDay);

  const total = {
    calories: 0,
    carbs: 0,
    sugar: 0,
    protein: 0,
    dangerousSpikes: 0
  };

  blockEntries.forEach(entry => {
    total.calories += entry.calories;
    total.carbs += entry.carbs;
    total.sugar += entry.sugar;
    total.protein += entry.protein;
    if (entry.finalScore > 180) total.dangerousSpikes++;
  });

  const avg = {
    calories: (total.calories / 7).toFixed(2),
    carbs: (total.carbs / 7).toFixed(2),
    sugar: (total.sugar / 7).toFixed(2),
    protein: (total.protein / 7).toFixed(2)
  };

  summaryArea.insertAdjacentHTML('beforeend', `
    <div class="summary">
      <h3>Days ${startDay} to ${endDay} Summary</h3>
      <strong>Total Nutrients Consumed:</strong><br>
      Calories: ${total.calories}<br>
      Carbs: ${total.carbs}g<br>
      Sugar: ${total.sugar}g<br>
      Protein: ${total.protein}g<br><br>

      <strong>Average Nutrients per Day:</strong><br>
      Calories: ${avg.calories}<br>
      Carbs: ${avg.carbs}g<br>
      Sugar: ${avg.sugar}g<br>
      Protein: ${avg.protein}g<br><br>

      <strong>Dangerous Glucose Spikes:</strong> ${total.dangerousSpikes}
    </div>
  `);
}

let summaryVisible = false;
summaryBtn.addEventListener('click', () => {
  summaryVisible = !summaryVisible;
  summaryArea.style.display = summaryVisible ? 'block' : 'none';
});

function updateCharacter(glucoseLevel) {
  const character = document.querySelector('#character');
  if (glucoseLevel > 180) {
    character.textContent = '😢';
  } else if (glucoseLevel < 120) {
    character.textContent = '😊';
  } else {
    character.textContent = '😐';
  }
}

function renderGraph() {
  // Adjust y domain dynamically based on current day data
  yScale.domain([50, d3.max(glucoseArray, d => d.finalScore) + 20]);
  yAxis.call(d3.axisLeft(yScale));

  const linePath = lineGenerator(glucoseArray);
  path.datum(glucoseArray).attr("d", linePath);

  // Animate line drawing
  const totalLength = path.node().getTotalLength();
  path
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  // Remove old peaks & tooltips
  svg.selectAll(".peak-dot").remove();
  svg.selectAll(".peak-tooltip").remove();

  // Draw all peaks for current day (all points with finalScore > baseline)
  glucoseArray.forEach(point => {
    if (point.finalScore > baseline) {
      const peakDot = svg.append("circle")
        .attr("class", "peak-dot")
        .attr("cx", xScale(point.hour))
        .attr("cy", yScale(point.finalScore))
        .attr("r", 5)
        .attr("fill", "red");

      const tooltip = svg.append("text")
        .attr("class", "peak-tooltip")
        .attr("x", xScale(point.hour))
        .attr("y", yScale(point.finalScore) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "red")
        .style("opacity", 0)
        .text(`Peak: ${point.finalScore.toFixed(1)}`);

      peakDot
        .on("mouseover", () => tooltip.style("opacity", 1))
        .on("mouseout", () => tooltip.style("opacity", 0));
    }
  });
}
