export async function getEcoTips({ travelKm, travelMode, electricityKwh, diet, totalKg }) {
	await new Promise(r => setTimeout(r, 300))
	const tips = []
	if (travelMode === 'car' && travelKm > 0) {
		tips.push('Try walking or cycling for trips under 3 km when feasible.')
		tips.push('Carpool or use public transport 2x/week to reduce travel emissions.')
	}
	if (electricityKwh > 0) {
		tips.push('Switch to LED lighting and unplug idle devices to cut energy use ~15%.')
	}
	if (diet === 'nonveg' || diet === 'mixed') {
		tips.push('Swap one meat meal per day with plant-based options (~20% lower food emissions).')
	}
	if (totalKg > 15) {
		tips.push('Set a weekly goal to reduce total emissions by 10%.')
	}
	return tips
}
