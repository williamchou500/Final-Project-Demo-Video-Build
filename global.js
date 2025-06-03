d3.select("#graph").html("");
const graph = d3.select("#graph");
const svg = graph.append("svg").attr("width", "100%").attr("height", 800);
const width = graph.node().getBoundingClientRect().width;
const height = 800;

console.log(width);

const breakfast = [
  {food: "Coffee", calories: 358.0, carbs: 70.0, sugars: 1.3, protein: 13.0, fiber: 0.0, fat: 0.1},
  {food: "Milk",   calories: 120.0, carbs: 9.0,  sugars: 8.0, protein: 12.0, fiber: 0.0, fat: 5.0},
  {food: "Pepsi",  calories: 150.0, carbs: 41.0, sugars: 41.0, protein: 0.0,  fiber: 0.0, fat: 0.0},
  {food: "Toast - Butter, Cheese, Mayo", calories: 111.0, carbs: 14.0, sugars: 1.6, protein: 2.6, fiber: 0.8, fat: 4.8},
  {food: "Donut",  calories: 253.0, carbs: 29.0, sugars: 14.0, protein: 3.7, fiber: 1.3, fat: 14.0}
];
const snack = [
  {food: "Coffee", calories: 358.0, carbs: 70.0, sugars: 1.3, protein: 13.0, fiber: 0.0, fat: 0.1},
  {food: "Milk",   calories: 120.0, carbs: 9.0,  sugars: 8.0, protein: 12.0, fiber: 0.0, fat: 5.0},
  {food: "Pepsi",  calories: 150.0, carbs: 41.0, sugars: 41.0, protein: 0.0,  fiber: 0.0, fat: 0.0},
  {food: "Toast - Butter, Cheese, Mayo", calories: 111.0, carbs: 14.0, sugars: 1.6, protein: 2.6, fiber: 0.8, fat: 4.8},
  {food: "Donut",  calories: 253.0, carbs: 29.0, sugars: 14.0, protein: 3.7, fiber: 1.3, fat: 14.0}
];
const lunch = [
  {food: "Coffee", calories: 358.0, carbs: 70.0, sugars: 1.3, protein: 13.0, fiber: 0.0, fat: 0.1},
  {food: "Milk",   calories: 120.0, carbs: 9.0,  sugars: 8.0, protein: 12.0, fiber: 0.0, fat: 5.0},
  {food: "Pepsi",  calories: 150.0, carbs: 41.0, sugars: 41.0, protein: 0.0,  fiber: 0.0, fat: 0.0},
  {food: "Toast - Butter, Cheese, Mayo", calories: 111.0, carbs: 14.0, sugars: 1.6, protein: 2.6, fiber: 0.8, fat: 4.8},
  {food: "Donut",  calories: 253.0, carbs: 29.0, sugars: 14.0, protein: 3.7, fiber: 1.3, fat: 14.0}
];
const dinner = [
  {food: "Coffee", calories: 358.0, carbs: 70.0, sugars: 1.3, protein: 13.0, fiber: 0.0, fat: 0.1},
  {food: "Milk",   calories: 120.0, carbs: 9.0,  sugars: 8.0, protein: 12.0, fiber: 0.0, fat: 5.0},
  {food: "Pepsi",  calories: 150.0, carbs: 41.0, sugars: 41.0, protein: 0.0,  fiber: 0.0, fat: 0.0},
  {food: "Toast - Butter, Cheese, Mayo", calories: 111.0, carbs: 14.0, sugars: 1.6, protein: 2.6, fiber: 0.8, fat: 4.8},
  {food: "Donut",  calories: 253.0, carbs: 29.0, sugars: 14.0, protein: 3.7, fiber: 1.3, fat: 14.0}
];


const x = d3.scaleLinear().domain([4, 27]).range([50, width - 50]);
const y = d3.scaleLinear().domain([100, 240]).range([height - 50, 50]);

const line = d3.line()
  .x(d => x(d.hour))
  .y(d => y(d.glucose))
  .curve(d3.curveMonotoneX);

const xAxis = svg.append("g")
  .attr("transform", `translate(0,${height - 50})`)
  .attr("stroke", "white")
  .call(
    d3.axisBottom(x)
      .tickValues(d3.range(4, 28))  // Ensure every hour is a tick
      .tickFormat(d => {
        const hour = d >= 24 ? d - 24 : d;
        return `${hour.toString().padStart(2, '0')}:00`;
      })
  );

xAxis.select("path.domain").attr("stroke", "white");
xAxis.selectAll("line").attr("stroke", "white");
xAxis.selectAll("text").attr("fill", "white");

const yAxis = svg.append("g")
  .attr("transform", `translate(50,0)`)
  .attr("stroke", "white")
  .call(d3.axisLeft(y));

yAxis.select("path.domain").attr("stroke", "white");
yAxis.selectAll("line").attr("stroke", "white");
yAxis.selectAll("text").attr("fill", "white");

// Y axis label
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 60)
  .attr("x", -height / 2)
  .attr("dy", "-3.5em")
  .attr("text-anchor", "middle")
  .attr("font-size", "14px")
  .attr("fill", "white")
  .text("Glucose (mg/dL)");


svg.append("line")
  .attr("x1", 50)
  .attr("x2", width - 50)
  .attr("y1", y(180))
  .attr("y2", y(180))
  .attr("stroke", "red")
  .attr("stroke-width", 2)
  .attr("stroke-dasharray", "6,6");

svg.append("rect")
  .attr("x", 50)
  .attr("y", 50)
  .attr("width", width - 100)
  .attr("height", y(180) - 50)
  .attr("fill", "red")
  .attr("opacity", 0.3);



let data = [{ hour: 4, glucose: 110 }];  
const baseline = 110;                    
const mealStages = ["breakfast", "a snack", "lunch", "a snack", "dinner"];
let currentMealIndex = 0;
let lastMeal = null;


const dropRates = {
  breakfast: 10,
  snack:     16,
  lunch:     12,
  dinner:    14
};


const weights = {
  hour:          0.280645,
  HbA1c:         0.118344,
  total_carb:    0.112520,
  sugar:         0.110247,
  calories:      0.099352,
  protein:       0.090501,
  total_fat:     0.078747,
  dietary_fiber: 0.061027,
  gender:        0.048618
};

const mealForm       = document.getElementById("mealForm");
const mealLabel      = document.getElementById("mealLabel");
const promptBox      = document.getElementById("promptBox");
const promptMessage  = document.getElementById("promptMessage");
const mealTimeSlider = document.getElementById("mealTimeSlider");
const sliderLabel    = document.getElementById("sliderLabel");
const confirmTimeBtn = document.getElementById("confirmTimeBtn");

const timeInput      = document.getElementById("time");
const timeLabel      = document.getElementById("timeLabel");
const foodButtons    = document.getElementById("foodButtons");
const submitBtn      = document.getElementById("submit");
const ship           = document.getElementById("ship");

let danger_count = 0;
let too_dangerous = false;

let total_carbs = 0;
let total_sugars = 0;
let total_protein = 0;
let total_fiber = 0;
let total_fat = 0;

let selectedFood = null;
let path = null;
let previousLength = 0;

// Initialize ship position at starting point (4:00 AM, 110 glucose)
function initializeShip() {
  ship.style.display = "block";
  const startX = x(4);
  const startY = y(110);
  const graphRect = graph.node().getBoundingClientRect();
  ship.style.left = `${startX + graphRect.left}px`;
  ship.style.top = `${startY + graphRect.top - 20}px`;
  
  // Position prompt next to ship
  updatePromptPosition(startX + graphRect.left, startY + graphRect.top);
}

// Function to update prompt position next to ship
function updatePromptPosition(shipX, shipY) {
  if (promptBox && !promptBox.classList.contains("hidden")) {
    promptBox.style.position = "absolute";
    promptBox.style.left = `${shipX-60}px`; // 50px to the right of ship
    promptBox.style.top = `${shipY-180}px`;  // Slightly above ship center
    promptBox.style.zIndex = "1000";
  }
}

function drawLine() {
  if (!path) {
    path = svg.append("path")
      .datum(data)
      .attr("class", "glucose-line")
      .attr("fill", "none")
      .attr("stroke", "none")
      .attr("d", line);

    previousLength = 0;
  } else {
    path.datum(data).attr("d", line);
  }

  const newLength = path.node().getTotalLength();
  const segmentLength = newLength - previousLength;
  animateSmokyPath(previousLength, newLength);
  previousLength = newLength;
}
const defs = svg.append("defs");
defs.append("filter")
  .attr("id", "smoke-blur")
  .append("feGaussianBlur")
  .attr("in", "SourceGraphic")
  .attr("stdDeviation", 2); 

function animateSmokyPath(startLength, endLength) {
  ship.style.display = "block";

  const duration = 4000;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentLength = startLength + (endLength - startLength) * progress;
    const point = path.node().getPointAtLength(currentLength);
    const nextPoint = path.node().getPointAtLength(Math.min(currentLength + 1, endLength));
    const dx = nextPoint.x - point.x;
    const dy = nextPoint.y - point.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const graphRect = graph.node().getBoundingClientRect();
    const shipLeft = point.x + graphRect.left;
    const shipTop = point.y + graphRect.top - (ship.offsetHeight / 2);


    ship.style.left = `${shipLeft}px`;
    ship.style.top = `${shipTop}px`;
    ship.style.transform = `rotate(${angle}deg)`;

    updatePromptPosition(shipLeft + 20, shipTop + 20);
    svg.append("circle")
      .attr("cx", point.x)
      .attr("cy", point.y)
      .attr("r", Math.random() * 8 + 4)
      .attr("fill", "white")
      .attr("opacity", 0.05 + Math.random() * 0.1)
      .attr("filter", "url(#smoke-blur)");

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      if (currentMealIndex < mealStages.length) {
        setTimeout(promptNextMeal, 500);
      }
    }
  }

  requestAnimationFrame(step);
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
  mealTimeSlider.value = minHour;

  sliderLabel.textContent = `${minHour % 24}:00`;

  mealForm.style.display = "none";
  promptBox.classList.remove("hidden");
  promptMessage.textContent = `I want to eat ${mealStages[currentMealIndex]} at:`;
  
  // Update prompt position to current ship location
  const shipRect = ship.getBoundingClientRect();
  updatePromptPosition(shipRect.left, shipRect.top);
}


function renderFoodButtons() {

  foodButtons.innerHTML = "";
  selectedFood = null;

  const mealType = mealStages[currentMealIndex];
  let list = [];
  if (mealType === "breakfast") list = breakfast;
  else if (mealType === "a snack") list = snack;
  else if (mealType === "lunch") list = lunch;
  else if (mealType === "dinner") list = dinner;

  list.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.textContent = item.food;
    btn.classList.add("food-btn");
    btn.addEventListener("click", () => {
    
      document.querySelectorAll(".food-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedFood = item;
    });
    foodButtons.appendChild(btn);
  });
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


  renderFoodButtons();
});


submitBtn.addEventListener("click", () => {
  if (!selectedFood) {
    alert("pick a food item first!");
    return;
  }

  const hour = parseInt(timeInput.value);
  const mealType = mealStages[currentMealIndex];


  const { calories, carbs, sugars, protein, fiber, fat } = selectedFood;


  let gender = (document.location.pathname.includes("/female/")) ? 0 : 1;

  const increment =
    calories * weights.calories +
    carbs    * weights.total_carb +
    sugars   * weights.sugar +
    protein  * weights.protein +
    fiber    * weights.dietary_fiber +
    fat      * weights.total_fat +
    hour     * weights.hour +
    gender   * weights.gender;

 
  let currentGlucose = getGlucoseAtHour(hour);


  if (lastMeal) {
    const timeSinceLastPeak = hour - lastMeal.peakHour;
    const dropRate = dropRates[lastMeal.type] || 12;
    const expectedDrop = timeSinceLastPeak * dropRate;
    const projectedGlucose = lastMeal.peakValue - expectedDrop;

    if (projectedGlucose > baseline) {

      data.push({ hour, glucose: projectedGlucose });
      currentGlucose = projectedGlucose;
    } else {

      const timeToBaseline = (lastMeal.peakValue - baseline) / dropRate;
      const baselineHour = Math.ceil(lastMeal.peakHour + timeToBaseline);

      if (baselineHour < hour) {
        data.push({ hour: baselineHour, glucose: baseline });
        data.push({ hour: hour,       glucose: baseline });
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
  const peakValue = currentGlucose + increment;

  if (peakValue > 180) {
    danger_count++;
  } 

  if (peakValue >= 240) {
      too_dangerous = true;
  }

  console.log(`Number of Dangerous Spikes: ${danger_count}`);
  console.log(`It got too dangerous? ${too_dangerous}`);

  data.push({ hour: peakHour, glucose: peakValue });
  lastMeal = { hour, peakHour, peakValue, type: mealType };
  currentMealIndex++;

  if (currentMealIndex >= mealStages.length) {
    drawLine();
    mealForm.innerHTML = "<h3 style=color:white;>All meals logged! Here's your glucose curve for the day.</h3>";
  } else {
    drawLine();
  }
});

// Initialize ship position when the page loads
initializeShip();

promptNextMeal();
