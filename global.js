const savedRuns = localStorage.getItem("allGlucoseRuns");

localStorage.clear();

if (savedRuns) {
  localStorage.setItem("allGlucoseRuns", savedRuns);
}


let allRuns = JSON.parse(localStorage.getItem("allGlucoseRuns") || "[]");

window.onload = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const restart = queryParams.get("restart");

  // Load ALL past runs
  const allRuns = JSON.parse(localStorage.getItem("allGlucoseRuns") || "[]");

  if (restart === "1") {
    // Start a new run
    danger_count = 0;
    too_dangerous = false;
    data = [{ hour: 4, glucose: 110 }];
    currentMealIndex = 0;
    lastMeal = null;
  } else {
    // If not a restart, you can optionally recover most recent run
    const lastRun = allRuns.length > 0 ? allRuns[allRuns.length - 1].data : null;
    if (lastRun) {
      data = lastRun;
    }
  }

  initializeShip();

  // Draw all past runs (gray, dashed)
  allRuns.forEach(run => {
    svg.append("path")
      .datum(run.data)
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .attr("d", line);
  });

  // Draw active run line (starts with baseline point)
  drawLine();
  promptNextMeal();
  localStorage.clear()
};

d3.select("#graph").html("");
const graph = d3.select("#graph");
const svg = graph.append("svg").attr("width", "100%").attr("height", 800);
const width = graph.node().getBoundingClientRect().width;
const height = 800;

let danger_count = 0;
let too_dangerous = false;
const ceilingGlucose = 240;

const breakfast = [
  {food: "Fried Eggs", calories: 90.0, carbs: 0.4, sugars: 0.4, protein: 6.3, fiber: 0.0, fat: 7.0},
  {food: "Bacon", calories: 180.0, carbs: 1.4, sugars: 0.0, protein: 12.0, fiber: 0.0, fat: 15.0},
  {food: "Pancakes with Syrup", calories: 350.0, carbs: 60.0, sugars: 14.0, protein: 6.0, fiber: 1.0, fat: 9.0},
  {food: "Bagel with Cream Cheese", calories: 290.0, carbs: 36.0, sugars: 5.0, protein: 9.0, fiber: 2.0, fat: 11.0},
  {food: "Orange Juice", calories: 110.0, carbs: 26.0, sugars: 21.0, protein: 2.0, fiber: 0.5, fat: 0.5},
  {food: "Cappuccino", calories: 60.0, carbs: 6.0, sugars: 5.0, protein: 3.0, fiber: 0.0, fat: 3.0},
  {food: "Water", calories: 0.0, carbs: 0.0, sugars: 0.0, protein: 0.0, fiber: 0.0, fat: 0.0},
  {food: "Oatmeal", calories: 150.0, carbs: 27.0, sugars: 1.0, protein: 5.0, fiber: 4.0, fat: 3.0},
  {food: "Avocado Toast", calories: 220.0, carbs: 20.0, sugars: 1.0, protein: 5.0, fiber: 5.0, fat: 14.0}
];
const snack = [
  {food: "Granola Bar", calories: 190.0, carbs: 25.0, sugars: 10.0, protein: 4.0, fiber: 2.0, fat: 7.0},
  {food: "Bag of Chips (2.5 oz)", calories: 390.0, carbs: 37.0, sugars: 0.5, protein: 4.0, fiber: 2.0, fat: 25.0},
  {food: "Apple Slices", calories: 80.0, carbs: 21.0, sugars: 16.0, protein: 0.5, fiber: 3.0, fat: 0.0},
  {food: "Iced Tea", calories: 90.0, carbs: 23.0, sugars: 22.0, protein: 0.0, fiber: 0.0, fat: 0.0},
  {food: "Smoothie", calories: 140.0, carbs: 30.0, sugars: 25.0, protein: 2.0, fiber: 2.0, fat: 1.0},
  {food: "Water", calories: 0.0, carbs: 0.0, sugars: 0.0, protein: 0.0, fiber: 0.0, fat: 0.0}
];
const lunch = [
  {food: "Grilled Chicken Sandwich", calories: 430.0, carbs: 40.0, sugars: 6.0, protein: 35.0, fiber: 3.0, fat: 15.0},
  {food: "Cheeseburger", calories: 520.0, carbs: 35.0, sugars: 7.0, protein: 25.0, fiber: 2.0, fat: 30.0},
  {food: "Caesar Salad with Chicken", calories: 410.0, carbs: 10.0, sugars: 2.0, protein: 30.0, fiber: 3.0, fat: 28.0},
  {food: "Vegetable Stir Fry with Rice", calories: 450.0, carbs: 55.0, sugars: 8.0, protein: 10.0, fiber: 5.0, fat: 15.0},
  {food: "Lemonade", calories: 120.0, carbs: 31.0, sugars: 29.0, protein: 0.0, fiber: 0.0, fat: 0.0},
  {food: "Iced Coffee with Cream", calories: 90.0, carbs: 10.0, sugars: 7.0, protein: 2.0, fiber: 0.0, fat: 4.0},
  {food: "Water", calories: 0.0, carbs: 0.0, sugars: 0.0, protein: 0.0, fiber: 0.0, fat: 0.0}
];
const dinner = [
  {food: "Grilled Salmon with Veggies", calories: 520.0, carbs: 10.0, sugars: 3.0, protein: 40.0, fiber: 4.0, fat: 32.0},
  {food: "Spaghetti with Marinara Sauce", calories: 480.0, carbs: 65.0, sugars: 9.0, protein: 15.0, fiber: 6.0, fat: 12.0},
  {food: "Beef Tacos", calories: 560.0, carbs: 30.0, sugars: 3.0, protein: 28.0, fiber: 4.0, fat: 36.0},
  {food: "Chicken Stir Fry with Noodles", calories: 510.0, carbs: 45.0, sugars: 6.0, protein: 32.0, fiber: 4.0, fat: 20.0},
  {food: "Red Wine", calories: 125.0, carbs: 4.0, sugars: 1.0, protein: 0.1, fiber: 0.0, fat: 0.0},
  {food: "Water", calories: 0.0, carbs: 0.0, sugars: 0.0, protein: 0.0, fiber: 0.0, fat: 0.0},
  {food: "Apple Juice", calories: 110.0, carbs: 28.0, sugars: 24.0, protein: 0.5, fiber: 0.2, fat: 0.3}
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
  .attr("class", "xAxis")
  .call(
    d3.axisBottom(x)
      .tickValues(d3.range(4, 28))
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
  .attr("class", "yAxis")
  .call(d3.axisLeft(y));

yAxis.select("path.domain").attr("stroke", "white");
yAxis.selectAll("line").attr("stroke", "white");
yAxis.selectAll("text").attr("fill", "white");

// Y axis lable
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 60)
  .attr("x", -height / 2)
  .attr("dy", "-3.5em")
  .attr("text-anchor", "middle")
  .attr("font-size", "14px")
  .attr("fill", "white")
  .text("Glucose (mg/dL)");

svg.append("text")
  .attr("x", width / 2)
  .attr("y", height - 10)
  .attr("text-anchor", "middle")
  .attr("font-size", "14px")
  .attr("fill", "white")
  .text("Time");

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

svg.append("text")
  .attr("x", width - 60)
  .attr("y", y(180) - 10)
  .attr("fill", "red")
  .attr("font-size", "18px")
  .attr("font-family", "Orbitron")
  .attr("text-anchor", "end")
  .style("text-shadow", "0 0 6px red")
  .text("Danger Zone");

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

let total_calories = 0;
let total_carbs = 0;
let total_sugars = 0;
let total_protein = 0;
let total_fiber = 0;
let total_fat = 0;

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
let path = null;
let previousLength = 0;

// Add this CSS for the tooltip (add to your existing CSS)
const tooltipStyles = `
.food-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.4;
  z-index: 1000;
  pointer-events: none;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.food-tooltip h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: bold;
  color: #4CAF50;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
}

.nutrition-item {
  display: flex;
  justify-content: space-between;
}

.nutrition-label {
  font-weight: 500;
}

.nutrition-value {
  color: #FFF;
}
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = tooltipStyles;
document.head.appendChild(styleSheet);

// Create tooltip element
let tooltip = null;

function createTooltip() {
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.classList.add('food-tooltip');
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

function showTooltip(event, foodItem) {
  const tooltip = createTooltip();
  
  // Format nutritional information
  const nutritionHTML = `
    <h4>${foodItem.food}</h4>
    <div class="nutrition-grid">
      <div class="nutrition-item">
        <span class="nutrition-label">Calories:</span>
        <span class="nutrition-value">${foodItem.calories}</span>
      </div>
      <div class="nutrition-item">
        <span class="nutrition-label">Carbs:</span>
        <span class="nutrition-value">${foodItem.carbs}g</span>
      </div>
      <div class="nutrition-item">
        <span class="nutrition-label">Sugars:</span>
        <span class="nutrition-value">${foodItem.sugars}g</span>
      </div>
      <div class="nutrition-item">
        <span class="nutrition-label">Protein:</span>
        <span class="nutrition-value">${foodItem.protein}g</span>
      </div>
      <div class="nutrition-item">
        <span class="nutrition-label">Fiber:</span>
        <span class="nutrition-value">${foodItem.fiber}g</span>
      </div>
      <div class="nutrition-item">
        <span class="nutrition-label">Fat:</span>
        <span class="nutrition-value">${foodItem.fat}g</span>
      </div>
    </div>
  `;
  
  tooltip.innerHTML = nutritionHTML;
  tooltip.style.display = 'block';
  
  // Position tooltip
  const rect = event.target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let left = rect.right + 10;
  let top = rect.top;
  
  // Adjust if tooltip would go off screen
  if (left + tooltipRect.width > window.innerWidth) {
    left = rect.left - tooltipRect.width - 10;
  }
  
  if (top + tooltipRect.height > window.innerHeight) {
    top = window.innerHeight - tooltipRect.height - 10;
  }
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

function initializeShip() {
  ship.style.display = "block";
  const startX = x(4);
  const startY = y(110);
  const graphRect = graph.node().getBoundingClientRect();
  ship.style.left = `${startX + graphRect.left}px`;
  ship.style.top = `${startY + graphRect.top - 20}px`;
  updatePromptPosition(startX + graphRect.left, startY + graphRect.top);
}

function updatePromptPosition(shipX, shipY) {
  if (promptBox && !promptBox.classList.contains("hidden")) {
    promptBox.style.position = "absolute";
    promptBox.style.left = `${shipX + 40}px`;
    promptBox.style.top = `${shipY - 200}px`;
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
  animateSmokyPath(previousLength, newLength);
  previousLength = newLength;
}

const defs = svg.append("defs");
defs.append("filter")
  .attr("id", "smoke-blur")
  .append("feGaussianBlur")
  .attr("in", "SourceGraphic")
  .attr("stdDeviation", 2);

function createBangEffect(cx, cy) {
  const bang = svg.append("circle")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", 0)
    .attr("fill", "white")
    .attr("opacity", 0.9)
    .attr("filter", "url(#smoke-blur)");

  bang.transition()
    .duration(600)
    .attr("r", 90)
    .attr("opacity", 0)
    .remove();
}

function animateSmokyPath(startLen, endLen) {
  ship.style.display = "block";

  let gender = document.location.pathname.includes("/female/") ? "female" : "male";

  const duration = 4000;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentLength = startLen + (endLen - startLen) * progress;

    const point = path.node().getPointAtLength(currentLength);
    const currentGlucose = y.invert(point.y);

    if (currentGlucose >= ceilingGlucose) {
      const ceilingY = y(ceilingGlucose);
      const graphRect = graph.node().getBoundingClientRect();
      const shipLeft = point.x + graphRect.left -80;
      const shipTop = point.y + graphRect.top - 80;

      ship.style.left = `${shipLeft}px`;
      ship.style.top = `${shipTop}px`;
      ship.style.transform = `rotate(0deg)`;

      createBangEffect(point.x, ceilingY);
      if (gender === "female") ship.src = "../images/deadF.png"; else ship.src = "../images/deadM.png";
      
      setTimeout(() => {
        const tooFlag = 1;
        allRuns.push({
          timestamp: new Date().toISOString(),
          data: [...data],  // clone so it won't mutate later
        });
        
        localStorage.setItem("allGlucoseRuns", JSON.stringify(allRuns));
        
        window.location.href = `results.html?danger=${danger_count}&too=${tooFlag}&calories=${total_calories}&carbs=${total_carbs}&sugars=${total_sugars}&protein=${total_protein}&fiber=${total_fiber}&fat=${total_fat}`;
      }, 800);
    }

    const nextPoint = path.node().getPointAtLength(Math.min(currentLength + 1, endLen));
    const ndx = nextPoint.x - point.x;
    const ndy = nextPoint.y - point.y;
    const nang = Math.atan2(ndy, ndx) * (180 / Math.PI);

    const smokeY = point.y

    svg.append("circle")
      .attr("cx", point.x)
      .attr("cy", smokeY)
      .attr("r", Math.random() * 8 + 4)
      .attr("fill", "white")
      .attr("opacity", 0.05 + Math.random() * 0.1)
      .attr("filter", "url(#smoke-blur)");

    const graphRect = graph.node().getBoundingClientRect();
    const shipLeft = point.x + graphRect.left - 80;
    const shipTop = point.y + graphRect.top - 80;

    ship.style.left = `${shipLeft}px`;
    ship.style.top = `${shipTop}px`;
    ship.style.transform = `rotate(${nang}deg)`;

    if (currentGlucose > 180) {
      const redSrc = gender === "female" ? "redF.png" : "redM.png";
      if (!ship.src.includes(redSrc)) ship.src = `../images/${redSrc}`;
    } else {
      const greenSrc = gender === "female" ? "rocketg.png" : "rocketm.png";
      if (!ship.src.includes(greenSrc)) ship.src = `../images/${greenSrc}`;
    }

    updatePromptPosition(shipLeft + 20, shipTop + 20);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (currentMealIndex < mealStages.length) {
          setTimeout(promptNextMeal, 500);
        } else {
          setTimeout(() => {
            const tooFlag = too_dangerous ? 1 : 0;
            allRuns.push({
              timestamp: new Date().toISOString(),
              data: [...data],  // clone so it won't mutate later
            });
            
            localStorage.setItem("allGlucoseRuns", JSON.stringify(allRuns));
            
            window.location.href = `results.html?danger=${danger_count}&too=${tooFlag}&calories=${total_calories}&carbs=${total_carbs}&sugars=${total_sugars}&protein=${total_protein}&fiber=${total_fiber}&fat=${total_fat}`;
          }, 1000); // slight pause after animation
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
  if (lastMeal) suggestedNextHour = lastMeal.peakHour;

  const minHour = Math.max(4, Math.floor(suggestedNextHour));
  mealTimeSlider.min = minHour;
  mealTimeSlider.max = 27;
  mealTimeSlider.value = minHour;
  sliderLabel.textContent = `${minHour % 24}:00`;

  const mealType = mealStages[currentMealIndex];
  mealForm.style.display = "none";
  promptBox.classList.remove("hidden");

  const shipRect = ship.getBoundingClientRect();
  updatePromptPosition(shipRect.left, shipRect.top);

  if (mealType === "a snack") {
    promptMessage.innerHTML = `
      <div style="text-align: center; max-width: 300px; margin: 0 auto;">
        <p style="white-space: nowrap; font-size: 20px;">Do I want to have a snack?</p>
        <button id="yesSnackBtn">Yes</button> 
        <button id="noSnackBtn">No</button>
      </div>
    `;

    mealTimeSlider.style.display = "none";
    sliderLabel.style.display = "none";
    confirmTimeBtn.style.display = "none";

    document.getElementById("yesSnackBtn").onclick = () => {
      promptMessage.textContent = `I want to eat a snack at:`;
      mealTimeSlider.style.display = "block";
      sliderLabel.style.display = "block";
      confirmTimeBtn.style.display = "block";
    };

    document.getElementById("noSnackBtn").onclick = () => {
      currentMealIndex++;
      promptNextMeal();
    };
  } else {
    promptMessage.textContent = `I want to eat ${mealType} at:`;
    mealTimeSlider.style.display = "block";
    sliderLabel.style.display = "block";
    confirmTimeBtn.style.display = "block";
  }
}
let selectedFoods = [];

// Modified renderFoodButtons function
function renderFoodButtons() {
  foodButtons.innerHTML = "";
  selectedFoods = [];

  const mealType = mealStages[currentMealIndex];
  let list = [];
  if (mealType === "breakfast") list = breakfast;
  else if (mealType === "a snack") list = snack;
  else if (mealType === "lunch") list = lunch;
  else if (mealType === "dinner") list = dinner;

  const imageMap = {
    "Fried Eggs": "egg.png",
    "Bacon": "bacon.png",
    "Pancakes with Syrup": "pancakes.png",
    "Bagel with Cream Cheese": "bagel.png",
    "Orange Juice": "juice.png",
    "Cappuccino": "coffee.png",
    "Water": "water.png",
    "Oatmeal": "oatmeal.png",
    "Avocado Toast": "toast.png",

    "Granola Bar": "granola.png",
    "Bag of Chips": "chips.png",
    "Apple Slices": "apple.png",
    "Iced Tea": "tea.png",
    "Smoothie": "smoothie.png",
    "Water": "water.png",

    "Grilled Chicken Sandwich": "sandwhich.png",
    "Cheeseburger": "burger.png",
    "Caesar Salad with Chicken": "salad.png",
    "Vegetable Stir Fry with Rice": "veggie.png",
    "Lemonade": "lemonade.png",
    "Iced Coffee with Cream": "iced.png",
    "Water": "water.png",

    "Grilled Salmon with Veggies": "salmon.png",
    "Spaghetti with Marinara Sauce": "pasta.png",
    "Beef Tacos": "tacos.png",
    "Chicken Stir Fry with Noodles": "chicken.png",
    "Red Wine": "wine.png",
    "Water": "water.png",
    "Apple Juice": "apple juice.png"
  };

  list.forEach(item => {
    const container = document.createElement("div");
    container.classList.add("food-item");

    const img = document.createElement("img");
    img.classList.add("food-img");

    const imageName = imageMap[item.food] || "toast.png";
    img.src = `../images/${imageName}`;
    img.alt = item.food;

    // Add tooltip event listeners to the image
    img.addEventListener("mouseenter", (e) => showTooltip(e, item));
    img.addEventListener("mouseleave", hideTooltip);
    img.addEventListener("mousemove", (e) => {
      if (tooltip && tooltip.style.display === 'block') {
        const rect = e.target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.right + 10;
        let top = rect.top;
        
        if (left + tooltipRect.width > window.innerWidth) {
          left = rect.left - tooltipRect.width - 10;
        }
        
        if (top + tooltipRect.height > window.innerHeight) {
          top = window.innerHeight - tooltipRect.height - 10;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      }
    });

    const label = document.createElement("div");
    label.classList.add("food-label");
    label.textContent = item.food;

    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.value = 1;
    input.classList.add("quantity-input");

    let isSelected = false;

    container.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;

      isSelected = !isSelected;
      container.classList.toggle("selected");

      const quantity = parseInt(input.value) || 1;
      const index = selectedFoods.findIndex(f => f.food === item.food);

      if (isSelected) {
        selectedFoods.push({ ...item, quantity });
      } else {
        if (index !== -1) selectedFoods.splice(index, 1);
      }
    });

    input.addEventListener("input", () => {
      const quantity = parseInt(input.value) || 1;
      const index = selectedFoods.findIndex(f => f.food === item.food);
      if (index !== -1) selectedFoods[index].quantity = quantity;
    });

    container.appendChild(img);
    container.appendChild(label);
    container.appendChild(input);
    foodButtons.appendChild(container);
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
  if (selectedFoods.length === 0) {
    alert("Pick at least one food item!");
    return;
  }

  const hour = parseInt(timeInput.value);
  const mealType = mealStages[currentMealIndex];
  let gender = document.location.pathname.includes("/female/") ? 0 : 1;

  const quantityTotal = selectedFoods.reduce((acc, food) => {
    const { quantity, calories, carbs, sugars, protein, fiber, fat } = food;
    acc.calories += calories * quantity;
    acc.carbs    += carbs    * quantity;
    acc.sugars   += sugars   * quantity;
    acc.protein  += protein  * quantity;
    acc.fiber    += fiber    * quantity;
    acc.fat      += fat      * quantity;
    return acc;
  }, { calories: 0, carbs: 0, sugars: 0, protein: 0, fiber: 0, fat: 0 });

  const increment =
    quantityTotal.calories * weights.calories +
    quantityTotal.carbs    * weights.total_carb +
    quantityTotal.sugars   * weights.sugar +
    quantityTotal.protein  * weights.protein +
    quantityTotal.fiber    * weights.dietary_fiber +
    quantityTotal.fat      * weights.total_fat +
    hour                   * weights.hour +
    gender                 * weights.gender;

  total_calories += quantityTotal.calories;
  total_carbs += quantityTotal.carbs;
  total_sugars += quantityTotal.sugars;
  total_protein += quantityTotal.protein;
  total_fiber += quantityTotal.fiber;
  total_fat += quantityTotal.fat;

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

  if (peakHour >= 23) {
    data.push({ hour: peakHour, glucose: currentGlucose + increment });
    allRuns.push({
      timestamp: new Date().toISOString(),
      data: [...data],  // clone so it won't mutate later
    });
    
    localStorage.setItem("allGlucoseRuns", JSON.stringify(allRuns));
    
    drawLine();
    setTimeout(() => {
      const tooFlag = too_dangerous ? 1 : 0;
      window.location.href = `results.html?danger=${danger_count}&too=${tooFlag}`;
    }, 1000); // optional pause for animation
    return;
  }

  if (peakValue > 180) danger_count++;
  if (peakValue >= 240) too_dangerous = true;

  data.push({ hour: peakHour, glucose: peakValue });
  lastMeal = { hour, peakHour, peakValue, type: mealType };
  currentMealIndex++;

  if (currentMealIndex >= mealStages.length) {
    drawLine();
  } else {
    drawLine();
  }
});

// Initialize ship position when the page loads
initializeShip();

promptNextMeal();
