export const EMISSION_FACTORS = {
	travelPerKmKg: {
		car: 0.21,
		bus: 0.1,
		train: 0.05,
		bike: 0,
		walk: 0,
	},
	electricityPerKwhKg: 0.82,
	foodPerDayKg: {
		vegan: 1.5,
		vegetarian: 2.0,
		mixed: 3.0,
		nonveg: 5.0,
	},
}

export function calculateDailyEmissions({ travelKm = 0, travelMode = 'car', electricityKwh = 0, diet = 'mixed' }) {
	const travelFactor = EMISSION_FACTORS.travelPerKmKg[travelMode] ?? EMISSION_FACTORS.travelPerKmKg.car
	const travelKg = Number(travelKm) * travelFactor
	const electricityKg = Number(electricityKwh) * EMISSION_FACTORS.electricityPerKwhKg
	const foodKg = EMISSION_FACTORS.foodPerDayKg[diet] ?? EMISSION_FACTORS.foodPerDayKg.mixed
	const totalKg = +(travelKg + electricityKg + foodKg).toFixed(2)
	return { travelKg: +travelKg.toFixed(2), electricityKg: +electricityKg.toFixed(2), foodKg: +foodKg.toFixed(2), totalKg }
}

export function computeEcoScore(totalKg) {
	const targetKgPerDay = 10
	const raw = 100 - (totalKg / targetKgPerDay) * 100
	const clamped = Math.max(0, Math.min(100, Math.round(raw)))
	return clamped
}
