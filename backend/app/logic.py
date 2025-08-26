EMISSION_FACTORS = {
	"travelPerKmKg": {
		"car": 0.21,
		"bus": 0.10,
		"train": 0.05,
		"bike": 0.0,
		"walk": 0.0,
	},
	"electricityPerKwhKg": 0.82,
	"foodPerDayKg": {
		"vegan": 1.5,
		"vegetarian": 2.0,
		"mixed": 3.0,
		"nonveg": 5.0,
	},
}

def calculate_emissions(travel_km: float, travel_mode: str, electricity_kwh: float, diet: str):
	travel_factor = EMISSION_FACTORS["travelPerKmKg"].get(travel_mode, EMISSION_FACTORS["travelPerKmKg"]["car"])
	travel_kg = round(float(travel_km) * travel_factor, 2)
	electricity_kg = round(float(electricity_kwh) * EMISSION_FACTORS["electricityPerKwhKg"], 2)
	food_kg = EMISSION_FACTORS["foodPerDayKg"].get(diet, EMISSION_FACTORS["foodPerDayKg"]["mixed"])
	total_kg = round(travel_kg + electricity_kg + food_kg, 2)
	return travel_kg, electricity_kg, food_kg, total_kg

def compute_eco_score(total_kg: float) -> int:
	target = 10.0
	score = 100 - (total_kg / target) * 100
	return max(0, min(100, round(score)))

def generate_tips(travel_km: float, travel_mode: str, electricity_kwh: float, diet: str, total_kg: float):
	tips = []
	if travel_mode == 'car' and travel_km > 0:
		tips.append('Try walking or cycling for trips under 3 km when feasible.')
		tips.append('Carpool or use public transport 2x/week to reduce travel emissions.')
	if electricity_kwh > 0:
		tips.append('Switch to LED lighting and unplug idle devices to cut energy use ~15%.')
	if diet in ('nonveg', 'mixed'):
		tips.append('Swap one meat meal per day with plant-based options (~20% lower food emissions).')
	if total_kg > 15:
		tips.append('Set a weekly goal to reduce total emissions by 10%.')
	return tips
