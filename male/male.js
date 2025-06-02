d3.select("#graph").html("");
const graph = d3.select("#graph");
const svg = graph.append("svg").attr("width", "100%").attr("height", 400);
const width = graph.node().getBoundingClientRect().width;
const height = 400;

const x = d3.scaleLinear().domain([0, 24]).range([50, width - 50]);
const y = d3.scaleLinear().domain([100, 240]).range([height - 50, 50]);

const line = d3.line()
  .x(d => x(d.hour))
  .y(d => y(d.glucose))
  .curve(d3.curveMonotoneX);

svg.append("g")
  .attr("transform", `translate(0,${height - 50})`)
  .call(d3.axisBottom(x).ticks(24).tickFormat(d => `${d}:00`));

svg.append("g")
  .attr("transform", `translate(50,0)`)
  .call(d3.axisLeft(y));

let data = [];
const baseline = 110;
const mealStages = ["breakfast", "snack", "lunch", "snack", "dinner"];
let currentMealIndex = 0;
let firstMealTime = null;
let lastMeal = null;

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

  // Initialize dash array for animation
  path
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength);

  ship.style.display = "block";

  let start = null;
  function animateShip(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const duration = 4000; // 4 seconds animation
    const progress = Math.min(elapsed / duration, 1);

    // Animate stroke dashoffset
    path.attr("stroke-dashoffset", totalLength * (1 - progress));

    // Move ship along the path
    const pointAtLength = path.node().getPointAtLength(progress * totalLength);

    // Calculate graph's bounding rect to position ship absolutely
    const graphRect = graph.node().getBoundingClientRect();

    ship.style.left = `${pointAtLength.x + graphRect.left - 20}px`; // offset for centering ship
    ship.style.top = `${pointAtLength.y + graphRect.top - 20}px`;

    if (progress < 1) {
      requestAnimationFrame(animateShip);
    } else {
      // Animation finished, draw dots
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
  let suggestedNextHour = 8;
  if (lastMeal) {
    suggestedNextHour = lastMeal.peakHour;
  }
  mealTimeSlider.value = suggestedNextHour;
  sliderLabel.textContent = `${suggestedNextHour}:00`;

  mealForm.style.display = "none";
  promptBox.classList.remove("hidden");
  promptMessage.textContent = `When would you like to eat your ${mealStages[currentMealIndex]}?`;
}

mealTimeSlider.addEventListener("input", () => {
  sliderLabel.textContent = `${mealTimeSlider.value}:00`;
});

confirmTimeBtn.addEventListener("click", () => {
  const selectedHour = parseInt(mealTimeSlider.value);
  timeInput.value = selectedHour;
  timeLabel.textContent = selectedHour;
  firstMealTime = firstMealTime === null ? selectedHour : firstMealTime;

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

  const increment =
    calories * weights.calories +
    carbs * weights.total_carb +
    sugar * weights.sugar +
    protein * weights.protein +
    Hb1Ac * weights.HbA1c +
    hour * weights.hour +
    dietary_fiber * weights.dietary_fiber +
    total_fat * weights.total_fat;

  const peakHour = hour + 1;
  const currentGlucose = getGlucoseAtHour(hour);
  const peakValue = currentGlucose + increment + 1 * weights.gender;

  if (data.length === 0) {
    data = [
      { hour: 0, glucose: baseline },
      { hour: hour, glucose: baseline },
    ];
  } else if (lastMeal) {
    const hoursSinceLastPeak = hour - lastMeal.peakHour;
    if (hoursSinceLastPeak >= 2) {
      data.push({ hour: lastMeal.peakHour + 2, glucose: baseline });
    } else if (hoursSinceLastPeak > 0) {
      const partialDropHour = hour;
      const partialGlucose = getGlucoseAtHour(partialDropHour);
      data.push({ hour: partialDropHour, glucose: partialGlucose });
    }
  }

  data.push({ hour: hour, glucose: currentGlucose });
  data.push({ hour: peakHour, glucose: peakValue });

  lastMeal = { hour, peakHour, peakValue };

  currentMealIndex++;

  if (currentMealIndex >= mealStages.length) {
    const finalDropHour = peakHour + 2;
    if (finalDropHour <= 24) {
      data.push({ hour: finalDropHour, glucose: baseline });
    }
    drawLine();
    mealForm.innerHTML = "<h3>All meals logged! Here's your glucose curve for the day.</h3>";
  } else {
    drawLine();
  }
});

// Start by prompting the first meal time
promptNextMeal();
