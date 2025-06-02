const graph = d3.select("#graph");
const svg = graph.append("svg").attr("width", "100%").attr("height", 800);
const width = graph.node().getBoundingClientRect().width;
const height = 800;

const x = d3.scaleLinear().domain([4, 27]).range([50, width - 50]);
const y = d3.scaleLinear().domain([100, 240]).range([height - 50, 50]);

const line = d3.line()
  .x(d => x(d.hour))
  .y(d => y(d.glucose))
  .curve(d3.curveMonotoneX);

svg.append("g")
  .attr("transform", `translate(0,${height - 50})`)
  .call(d3.axisBottom(x).ticks(24).tickFormat(d => `${(d % 24).toString().padStart(2, '0')}:00`));

svg.append("g")
  .attr("transform", `translate(50,0)`)
  .call(d3.axisLeft(y));

let data = [{ hour: 4, glucose: 110 }];
const baseline = 110;
const mealStages = ["breakfast", "snack", "lunch", "snack", "dinner"];
let currentMealIndex = 0;
let lastMeal = null;

const dropRates = {
  breakfast: -20,
  snack: -18,
  lunch: -15,
  dinner: -18
};

const mealForm = document.getElementById("mealForm");
const mealLabel = document.getElementById("mealLabel");
const promptBox = document.getElementById("promptBox");
const promptMessage = document.getElementById("promptMessage");
const mealTimeSlider = document.getElementById("mealTimeSlider");
const sliderLabel = document.getElementById("sliderLabel");
const confirmTimeBtn = document.getElementById("confirmTimeBtn");

const timeInput = document.getElementById("time");
const timeLabel = document.getElementById("timeLabel");
const submitBtn = document.getElementById("submit");
const ship = document.getElementById("ship");

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

function drawLine() {
  svg.selectAll(".glucose-line").remove();
  const path = svg.append("path")
    .datum(data)
    .attr("class", "glucose-line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  const totalLength = path.node().getTotalLength();

  path
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength);

  ship.style.display = "block";

  let start = null;
  function animateShip(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const duration = 4000;
    const progress = Math.min(elapsed / duration, 1);

    path.attr("stroke-dashoffset", totalLength * (1 - progress));

    const pointAtLength = path.node().getPointAtLength(progress * totalLength);
    const graphRect = graph.node().getBoundingClientRect();

    ship.style.left = `${pointAtLength.x + graphRect.left - 20}px`;
    ship.style.top = `${pointAtLength.y + graphRect.top - 20}px`;

    if (progress < 1) {
      requestAnimationFrame(animateShip);
    } else {
      svg.selectAll(".dot").data(data)
        .join("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.hour))
        .attr("cy", d => y(d.glucose))
        .attr("r", 4)
        .attr("fill", "orange");

      if (currentMealIndex < mealStages.length) {
        setTimeout(() => {
          promptNextMeal();
        }, 500);
      }
    }
  }

  requestAnimationFrame(animateShip);
}

function getGlucoseAtHour(targetHour) {
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const next = data[i];
    if (targetHour >= prev.hour && targetHour <= next.hour) {
      const ratio = (targetHour - prev.hour) / (next.hour - prev.hour);
      return prev.glucose + ratio * (next.glucose - prev.glucose);
    }
  }
  return baseline;
}

function promptNextMeal() {
  let suggestedNextHour = 4;
  if (lastMeal) {
    suggestedNextHour = lastMeal.peakHour;
  }

  const minHour = Math.max(4, Math.floor(suggestedNextHour));
  mealTimeSlider.min = minHour;
  mealTimeSlider.max = 27;
  mealTimeSlider.value = minHour; // Ensure initial value is within allowed range

  sliderLabel.textContent = `${minHour % 24}:00`;

  mealForm.style.display = "none";
  promptBox.classList.remove("hidden");
  promptMessage.textContent = `When would you like to eat your ${mealStages[currentMealIndex]}?`;
}


mealTimeSlider.addEventListener("input", () => {
  sliderLabel.textContent = `${mealTimeSlider.value % 24}:00`;
});

confirmTimeBtn.addEventListener("click", () => {
  const selectedHour = parseInt(mealTimeSlider.value);
  timeInput.value = selectedHour;
  timeLabel.textContent = selectedHour % 24;

  mealLabel.textContent = `Log your ${mealStages[currentMealIndex]}:`;
  promptBox.classList.add("hidden");
  mealForm.style.display = "block";
});

submitBtn.addEventListener("click", () => {
  const calories = parseFloat(document.querySelector('#calories').value) || 0;
  const carbs = parseFloat(document.querySelector('#carbs').value) || 0;
  const dietary_fiber = parseFloat(document.querySelector('#fiber').value) || 0;
  const sugar = parseFloat(document.querySelector('#sugar').value) || 0;
  const total_fat = parseFloat(document.querySelector('#fat').value) || 0;
  const protein = parseFloat(document.querySelector('#protein').value) || 0;
  const Hb1Ac = parseFloat(document.querySelector('#Hb1Ac').value) || 0;
  const hour = parseInt(timeInput.value);
  const mealType = mealStages[currentMealIndex];

  const increment =
    calories * weights.calories +
    carbs * weights.total_carb +
    sugar * weights.sugar +
    protein * weights.protein +
    Hb1Ac * weights.HbA1c +
    hour * weights.hour +
    dietary_fiber * weights.dietary_fiber +
    total_fat * weights.total_fat +
    0.048618;

  let currentGlucose = getGlucoseAtHour(hour);

  if (lastMeal) {
    const timeSinceLastPeak = hour - lastMeal.peakHour;
    const dropRate = dropRates[lastMeal.type] || 12;
    const expectedDrop = timeSinceLastPeak * dropRate;
    const projectedGlucose = lastMeal.peakValue - expectedDrop;

    if (projectedGlucose > baseline) {
      // Drop to projected glucose level
      data.push({ hour, glucose: projectedGlucose });
      currentGlucose = projectedGlucose;
    } else {
      // Compute when it would have reached baseline
      const timeToBaseline = (lastMeal.peakValue - baseline) / dropRate;
      const baselineHour = Math.ceil(lastMeal.peakHour + timeToBaseline);

      if (baselineHour < hour) {
        data.push({ hour: baselineHour, glucose: baseline });
        data.push({ hour: hour, glucose: baseline });
        currentGlucose = baseline;
      } else {
        const glucoseAtHour = lastMeal.peakValue - dropRate * (hour - lastMeal.peakHour);
        data.push({ hour, glucose: glucoseAtHour });
        currentGlucose = glucoseAtHour;
      }
    }
  } else {
    data.push({ hour, glucose: baseline });
    currentGlucose = baseline;
  }

  const peakHour = hour + 1;
  const peakValue = currentGlucose + increment + 1 * weights.gender;

  data.push({ hour: peakHour, glucose: peakValue });
  lastMeal = { hour, peakHour, peakValue, type: mealType };
  currentMealIndex++;

  if (currentMealIndex >= mealStages.length) {
    drawLine();
    mealForm.innerHTML = "<h3>All meals logged! Here's your glucose curve for the day.</h3>";
  } else {
    drawLine();
  }
});

promptNextMeal();
