
const POP_SIZE = 100;
const MUTATION_RATE = 0.05;
const NUM_CITIES = 10;
let cities = [];
let population = [];
let generation = 0;

function randomPosition() {
    return {x: Math.random() * 400, y: Math.random() * 400};
}

function initCities() {
    for (let i = 0; i < NUM_CITIES; i++) {
        cities.push(randomPosition());
    }
}

function initPopulation() {
    for (let i = 0; i < POP_SIZE; i++) {
        const route = cities.slice().sort(() => Math.random() - 0.5);
        population.push(route);
    }
}

function totalDistance(route) {
    let distance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        distance += Math.hypot(route[i+1].x - route[i].x, route[i+1].y - route[i].y);
    }
    distance += Math.hypot(route[0].x - route[route.length - 1].x, route[0].y - route[route.length - 1].y);
    return Math.max(distance, 0);  // Ensure non-negative
}

function mutate(route) {
    const index1 = Math.floor(Math.random() * route.length);
    const index2 = Math.floor(Math.random() * route.length);
    [route[index1], route[index2]] = [route[index2], route[index1]];
    return route;
}

function crossover(parent1, parent2) {
    const start = Math.floor(Math.random() * parent1.length);
    const end = Math.floor(Math.random() * parent1.length) + 1;
    const childPortion = parent1.slice(start, end);
    const remaining = parent2.filter(city => !childPortion.includes(city));
    return [...childPortion, ...remaining];
}

function newGeneration() {
    const newPop = [];
    for (let i = 0; i < POP_SIZE; i++) {
        const parent1 = selectParent();
        const parent2 = selectParent();
        let child = crossover(parent1, parent2);
        child = mutate(child);
        newPop.push(child);
    }
    population = newPop;
    generation++;
}

function selectParent() {
    let maxFitness = -Infinity;
    let totalFitness = 0;
    for (let route of population) {
        const fit = 1 / totalDistance(route);
        totalFitness += fit;
        if (fit > maxFitness) {
            maxFitness = fit;
        }
    }
    let random = Math.random() * totalFitness;
    for (let route of population) {
        if (random < 1/totalDistance(route) / maxFitness) {
            return route;
        }
        random -= 1/totalDistance(route) / maxFitness;
    }
    return population[0];
}

function draw() {
    const canvas = document.getElementById("tspCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bestRoute = population.sort((a, b) => totalDistance(a) - totalDistance(b))[0];
    for (let i = 0; i < bestRoute.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(bestRoute[i].x, bestRoute[i].y);
        ctx.lineTo(bestRoute[i+1].x, bestRoute[i+1].y);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(bestRoute[0].x, bestRoute[0].y);
    ctx.lineTo(bestRoute[bestRoute.length - 1].x, bestRoute[bestRoute.length - 1].y);
    ctx.stroke();

    for (let city of bestRoute) {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
    }
}

function startOptimization() {
    initCities();
    initPopulation();
    draw();

    let maxGenerations = 5000;
    const interval = setInterval(() => {
        newGeneration();
        draw();
        const bestRoute = population.sort((a, b) => totalDistance(a) - totalDistance(b))[0];
        document.getElementById("totalDistance").textContent = totalDistance(bestRoute).toFixed(2);
        document.getElementById("generation").textContent = generation;
        if (generation >= maxGenerations) {
            clearInterval(interval);
        }
    }, 50);
}
