
d3.select("#graph").html("");
const graph = d3.select("#graph");
const svg = graph.append("svg").attr("width", "100%").attr("height", 800);
const width = graph.node().getBoundingClientRect().width;
const height = 800;


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
  .call(d3.axisBottom(x).ticks(24).tickFormat(d => `${(d % 24).toString().padStart(2, '0')}:00`))

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
const mealStages = ["breakfast", "snack", "lunch", "snack", "dinner"];
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


let selectedFood = null;


function drawLine() {
  svg.selectAll(".glucose-line").remove();
  const path = svg.append("path")
    .datum(data)
    .attr("class", "glucose-line")
    .attr("fill", "none")
    .attr("stroke", "white")
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
  mealTimeSlider.value = minHour;

  sliderLabel.textContent = `${minHour % 24}:00`;

  mealForm.style.display = "none";
  promptBox.classList.remove("hidden");
  promptMessage.textContent = `When would you like to eat your ${mealStages[currentMealIndex]}?`;
}


function renderFoodButtons() {

  foodButtons.innerHTML = "";
  selectedFood = null;

  const mealType = mealStages[currentMealIndex];
  let list = [];
  if (mealType === "breakfast") list = breakfast;
  else if (mealType === "snack") list = snack;
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
