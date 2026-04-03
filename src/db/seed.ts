import { db } from "./index";
import { equipment, muscleGroups, exercises, cardioStretching } from "./schema";
import gymEquipment from "../../data/gym_equipment.json";
import muscleGroupsData from "../../data/muscle_groups.json";
import exercisesData from "../../data/exercises.json";
import cardioData from "../../data/cardio_core_stretching.json";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // 1. Equipment
  console.log("→ Seeding equipment...");
  await db.delete(equipment);
  await db
    .insert(equipment)
    .values(gymEquipment.map((item) => ({ name: item.name })));
  console.log(`  ✓ ${gymEquipment.length} equipment items\n`);

  // 2. Muscle Groups (flatten nested structure)
  console.log("→ Seeding muscle groups...");
  await db.delete(muscleGroups);
  const flatMuscleGroups = muscleGroupsData.flatMap((group) =>
    group.target_muscles.map((muscle) => ({
      majorGroup: group.major_group,
      targetMuscle: muscle,
    })),
  );
  await db.insert(muscleGroups).values(flatMuscleGroups);
  console.log(`  ✓ ${flatMuscleGroups.length} muscle group entries\n`);

  // 3. Exercises
  console.log("→ Seeding exercises...");
  await db.delete(exercises);
  await db.insert(exercises).values(
    exercisesData.map((e) => ({
      name: e.exercise_name,
      targetMuscle: e.target_muscle,
      muscleGroup: e.muscle_group,
      equipmentUsed: JSON.stringify(e.equipment_used),
      difficulty: e.difficulty,
      alternatives: JSON.stringify(e.alternatives),
      videoUrl: e.video_tutorial_link || null,
    })),
  );
  console.log(`  ✓ ${exercisesData.length} exercises\n`);

  // 4. Cardio / Core / Stretching
  console.log("→ Seeding cardio & stretching...");
  await db.delete(cardioStretching);
  await db.insert(cardioStretching).values(
    cardioData.map((e) => ({
      name: e.exercise_name,
      targetMuscle: e.target_muscle,
      category: e.category,
      equipmentUsed: JSON.stringify(e.equipment_used),
      difficulty: e.difficulty,
      alternatives: JSON.stringify(e.alternatives),
      videoUrl: e.video_tutorial_link || null,
    })),
  );
  console.log(`  ✓ ${cardioData.length} cardio/stretching entries\n`);

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
