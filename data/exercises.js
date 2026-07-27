// Exercise database — 150+ exercises with technique, variations, and alternatives.
// Categories: chest, back, shoulders, arms, legs, core, cardio, full_body
window.EXERCISE_DB = [
  // ============ CHEST ============
  { id: "bench-press-barbell", name: "Barbell Bench Press", category: "chest", met: 6.0, muscles: ["Pectorals", "Triceps", "Anterior Deltoids"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Lie flat on a bench with feet planted firmly on the floor.",
    "Grip the bar slightly wider than shoulder width, wrists stacked over elbows.",
    "Retract shoulder blades and arch your upper back slightly to create a stable base.",
    "Unrack the bar and hold it directly over your shoulders with arms extended.",
    "Lower the bar under control to your lower chest (nipple line), keeping elbows at ~75° to your torso.",
    "Touch the chest lightly without bouncing, then press up and slightly back toward the rack.",
    "Lock out arms at the top without shrugging the shoulders forward."
  ], mistakes: ["Flaring elbows to 90° (shoulder impingement risk)", "Bouncing the bar off the chest", "Lifting hips off the bench", "Uneven bar path"],
    variations: ["Close-grip bench press (triceps focus)", "Wide-grip bench press (chest focus)", "Paused bench press", "Touch-and-go bench press"],
    alternatives: ["Dumbbell bench press", "Machine chest press", "Push-ups", "Floor press"] },

  { id: "bench-press-dumbbell", name: "Dumbbell Bench Press", category: "chest", met: 5.5, muscles: ["Pectorals", "Triceps", "Anterior Deltoids"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Sit on a flat bench with dumbbells resting on your thighs.",
    "Lie back while kicking the dumbbells up to shoulder level.",
    "Position dumbbells at chest level with palms facing forward, wrists neutral.",
    "Press the weights up and slightly inward until arms are extended over the shoulders.",
    "Pause briefly at the top without clanking the dumbbells.",
    "Lower under control to a deep stretch at chest level, elbows at ~75°.",
    "Keep the core braced and lower back flat throughout."
  ], mistakes: ["Elbows flared to 90°", "Dumbbells drifting outward at lockout", "Bouncing at the bottom", "Neck lifting off the bench"],
    variations: ["Incline dumbbell press", "Decline dumbbell press", "Neutral-grip (hammer) press", "Alternating dumbbell press"],
    alternatives: ["Barbell bench press", "Machine chest press", "Push-ups", "Cable chest press"] },

  { id: "incline-bench-barbell", name: "Incline Barbell Bench Press", category: "chest", met: 6.0, muscles: ["Upper Pectorals", "Anterior Deltoids", "Triceps"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Set the bench to a 30–45° incline (30° emphasizes chest; steeper shifts to shoulders).",
    "Sit with feet flat, retract shoulder blades, and grip the bar just wider than shoulder width.",
    "Unrack and hold the bar over your upper chest with arms extended.",
    "Lower to the upper chest / collarbone area with elbows at ~65–75°.",
    "Press up in a slight arc toward the rack, locking out over the shoulders.",
    "Keep glutes and shoulders on the bench throughout."
  ], mistakes: ["Bench angle too steep (>45° recruits front delts)", "Bar drifting down to lower chest", "Elbows flaring", "Lifting hips"],
    variations: ["Incline dumbbell press", "Low incline (15–20°)", "Smith machine incline press", "Reverse-grip incline press"],
    alternatives: ["Incline dumbbell press", "Landmine press", "Incline machine press", "Decline push-up"] },

  { id: "incline-bench-dumbbell", name: "Incline Dumbbell Press", category: "chest", met: 5.5, muscles: ["Upper Pectorals", "Anterior Deltoids", "Triceps"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Set bench to 30°. Sit with dumbbells on thighs.",
    "Kick weights up to shoulders as you lie back.",
    "Palms forward, dumbbells level with upper chest.",
    "Press up and slightly in until arms extended over shoulders.",
    "Lower under control to a deep stretch on the upper chest.",
    "Maintain scapular retraction and stable core."
  ], mistakes: ["Bench too steep", "Dumbbells too far apart at top", "Losing tightness", "Elbows below 60°"],
    variations: ["Neutral-grip incline press", "Alternating incline press", "1½ rep incline press"],
    alternatives: ["Incline barbell press", "Landmine press", "Incline machine press"] },

  { id: "dips-chest", name: "Chest Dip", category: "chest", met: 5.5, muscles: ["Lower Pectorals", "Triceps", "Anterior Deltoids"], equipment: "Dip bars", gear: ["dip-bars"], technique: [
    "Grip parallel bars and support your body with arms extended.",
    "Lean torso forward ~30° to bias the chest (upright biases triceps).",
    "Lower slowly by bending elbows, allowing them to flare slightly outward.",
    "Descend until upper arms are parallel to the floor or you feel a strong chest stretch.",
    "Drive up powerfully through the palms, keeping the forward lean.",
    "Lock out arms without shrugging."
  ], mistakes: ["Staying upright (turns into triceps dip)", "Going too deep with poor mobility", "Kipping / swinging", "Elbows locking harshly"],
    variations: ["Weighted dip (with belt)", "Ring dip", "Bench dip (beginner)", "Assisted dip machine"],
    alternatives: ["Decline bench press", "Push-up", "Cable crossover", "Chest press machine"] },

  { id: "push-up", name: "Push-Up", category: "chest", met: 3.8, muscles: ["Pectorals", "Triceps", "Anterior Deltoids", "Core"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Place hands slightly wider than shoulder width, fingers spread, on the floor.",
    "Extend legs behind you, toes on the floor. Body forms a straight line from head to heels.",
    "Brace core and glutes. Neck neutral (look at the floor a foot in front of your hands).",
    "Bend elbows to 45–60° from your torso, lowering chest to just above the floor.",
    "Press through the palms back to the start, fully extending elbows without hyperextending.",
    "Maintain the plank line throughout — no hips sagging or piking."
  ], mistakes: ["Sagging hips", "Elbows flared to 90°", "Partial range of motion", "Head craning forward"],
    variations: ["Deficit push-up", "Diamond push-up (triceps)", "Wide push-up", "Archer push-up", "Decline push-up"],
    alternatives: ["Bench press", "Chest dip", "Dumbbell floor press", "Cable chest press"] },

  { id: "cable-crossover", name: "Cable Crossover", category: "chest", met: 5.0, muscles: ["Pectorals (inner and lower)", "Anterior Deltoids"], equipment: "Cable machine", gear: ["cable"], technique: [
    "Set both pulleys to the high position and attach D-handles.",
    "Grab a handle in each hand and step forward into a split stance.",
    "Lean torso forward slightly with a soft bend in the elbows.",
    "With arms in a fixed arc, bring hands down and across in front of your hips.",
    "Squeeze the chest hard at the bottom, hands crossing or touching.",
    "Slowly return along the same arc until you feel a strong chest stretch."
  ], mistakes: ["Bending elbows dynamically (turns into a press)", "Using momentum from the torso", "Standing too upright", "Not squeezing at the bottom"],
    variations: ["Low-to-high cable fly (upper chest)", "Mid-height cable fly", "Single-arm cable crossover"],
    alternatives: ["Dumbbell fly", "Pec deck machine", "Resistance band fly"] },

  { id: "dumbbell-fly", name: "Dumbbell Fly", category: "chest", met: 5.0, muscles: ["Pectorals", "Anterior Deltoids"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Lie on a flat bench holding dumbbells over your chest, palms facing each other.",
    "Keep a soft bend in the elbows (~15°) and lock that angle for the entire set.",
    "Open the arms outward in a wide arc, lowering until you feel a deep chest stretch.",
    "Stop when upper arms are roughly parallel to the floor — don't overstretch.",
    "Reverse the motion, squeezing the chest to bring dumbbells back over the shoulders.",
    "Never touch the dumbbells at the top; keep tension on the chest."
  ], mistakes: ["Bending elbows dynamically", "Going too heavy (shoulder strain)", "Dropping arms too low", "Touching dumbbells at top"],
    variations: ["Incline dumbbell fly", "Decline dumbbell fly", "Cable fly", "Machine pec deck"],
    alternatives: ["Cable crossover", "Pec deck machine", "Push-up plus"] },

  { id: "machine-chest-press", name: "Machine Chest Press", category: "chest", met: 5.0, muscles: ["Pectorals", "Triceps", "Anterior Deltoids"], equipment: "Machine", gear: ["machine"], technique: [
    "Adjust the seat so the handles align with the middle of your chest.",
    "Sit tall, retract shoulder blades, plant feet firmly.",
    "Grip the handles with wrists neutral, elbows slightly below shoulder height.",
    "Press forward until arms are extended without locking out harshly.",
    "Pause briefly, then return under control to a full chest stretch.",
    "Keep the shoulders back and down throughout."
  ], mistakes: ["Seat set too low (shoulders overwork)", "Flaring shoulders forward at the top", "Bouncing weight stack", "Half-reps"],
    variations: ["Iso-lateral (independent arms)", "Neutral-grip machine press", "Plate-loaded chest press"],
    alternatives: ["Barbell bench press", "Dumbbell bench press", "Cable chest press"] },

  { id: "decline-bench-press", name: "Decline Bench Press", category: "chest", met: 5.0, muscles: ["Lower Pectorals", "Triceps"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Secure feet under the decline bench pads. Lie back with the bench at 15–30°.",
    "Grip the bar slightly wider than shoulder width.",
    "Unrack (with a spotter if possible) and hold over your lower chest.",
    "Lower to the lower chest / sternum with elbows at ~70°.",
    "Press up powerfully and lock out over the shoulders.",
    "Rack safely at the end of the set."
  ], mistakes: ["Bar drifts toward the face (dangerous)", "Bouncing off chest", "Feet loose in the pads", "No spotter for heavy sets"],
    variations: ["Decline dumbbell press", "Decline close-grip press", "Smith machine decline"],
    alternatives: ["Chest dip", "Cable low-to-high fly", "Weighted push-up"] },

  // ============ BACK ============
  { id: "deadlift-conventional", name: "Conventional Deadlift", category: "back", met: 6.0, muscles: ["Erectors", "Glutes", "Hamstrings", "Lats", "Traps"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Stand with feet hip-width apart, bar over the middle of your foot (about 1 inch from shins).",
    "Bend at the hips and knees, gripping the bar just outside your shins.",
    "Set your back flat — chest up, shoulders slightly ahead of the bar, lats engaged (imagine squeezing oranges in your armpits).",
    "Take a deep breath into your belly and brace hard.",
    "Push the floor away with your legs while keeping the bar in contact with your shins.",
    "Once the bar passes the knees, drive hips forward to lock out. Squeeze glutes at the top.",
    "Return by hinging hips back first, then bending knees once the bar clears them. Reset each rep."
  ], mistakes: ["Rounding the lower back", "Bar drifting away from the body", "Hyperextending at lockout", "Jerking the bar off the floor"],
    variations: ["Sumo deadlift", "Deficit deadlift", "Paused deadlift", "Block/rack pulls"],
    alternatives: ["Trap-bar deadlift", "Romanian deadlift", "Kettlebell deadlift", "Barbell hip thrust"] },

  { id: "deadlift-romanian", name: "Romanian Deadlift (RDL)", category: "back", met: 5.5, muscles: ["Hamstrings", "Glutes", "Erectors"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Stand tall holding the bar at hip height, feet hip-width apart, soft knees.",
    "Push hips back as if closing a car door with your butt, letting the bar slide down your thighs.",
    "Keep the bar in contact with your legs and your back flat.",
    "Lower until you feel a deep hamstring stretch (usually mid-shin to just below the knee).",
    "Drive hips forward to return to standing, squeezing glutes at the top.",
    "Do not bend the knees more; the RDL is a hip hinge."
  ], mistakes: ["Squatting instead of hinging", "Rounding the back at the bottom", "Bar drifting away from body", "Overextending at the top"],
    variations: ["Dumbbell RDL", "Single-leg RDL", "Deficit RDL", "Snatch-grip RDL"],
    alternatives: ["Good morning", "Kettlebell swing", "Glute-ham raise", "Cable pull-through"] },

  { id: "pull-up", name: "Pull-Up", category: "back", met: 4.0, muscles: ["Lats", "Biceps", "Rear Deltoids", "Rhomboids"], equipment: "Pull-up bar", gear: ["pullup-bar"], technique: [
    "Grip the bar with palms facing away, hands slightly wider than shoulder width.",
    "Hang with arms fully extended, shoulders active (not shrugged into your ears).",
    "Retract shoulder blades first, then pull with your elbows driving down toward your hips.",
    "Lead with your chest and continue pulling until your chin clears the bar.",
    "Squeeze the lats and mid-back at the top for a beat.",
    "Lower under control to a full hang. Reset each rep."
  ], mistakes: ["Kipping / swinging", "Only chin over the bar with no chest lift", "Not lowering fully (partial range)", "Elbows flaring wide instead of down"],
    variations: ["Weighted pull-up", "Wide-grip pull-up", "Neutral-grip pull-up", "L-sit pull-up", "Archer pull-up"],
    alternatives: ["Chin-up", "Lat pulldown", "Assisted pull-up machine", "Inverted row"] },

  { id: "chin-up", name: "Chin-Up", category: "back", met: 4.0, muscles: ["Lats", "Biceps", "Rhomboids"], equipment: "Pull-up bar", gear: ["pullup-bar"], technique: [
    "Grip the bar with palms facing you, hands shoulder-width apart.",
    "Hang fully with active shoulders.",
    "Pull with the elbows driving down, keeping the chest proud.",
    "Continue until your chin is above the bar and the chest is close to it.",
    "Lower under control to a full hang."
  ], mistakes: ["Half reps", "Excessive kip", "Shrugging shoulders", "Wrists collapsing"],
    variations: ["Weighted chin-up", "Slow-eccentric chin-up", "Commando (mixed grip)"],
    alternatives: ["Pull-up", "Lat pulldown", "Inverted row"] },

  { id: "lat-pulldown", name: "Lat Pulldown", category: "back", met: 5.5, muscles: ["Lats", "Biceps", "Rhomboids"], equipment: "Cable machine", gear: ["cable"], technique: [
    "Secure knees under the pad and sit tall. Grip the bar wider than shoulder width, palms forward.",
    "Lean torso back ~15° and puff the chest.",
    "Depress and retract the scapula first, then pull the bar to your upper chest.",
    "Focus on driving the elbows down and back, not on pulling with the hands.",
    "Pause when the bar touches the upper chest.",
    "Return under control until arms are fully extended overhead."
  ], mistakes: ["Leaning back too far (turns into a row)", "Pulling with the biceps first", "Not extending fully at the top", "Yanking with momentum"],
    variations: ["Close-grip pulldown", "Neutral-grip pulldown", "Single-arm pulldown", "Reverse-grip pulldown"],
    alternatives: ["Pull-up", "Chin-up", "Machine pullover", "Straight-arm pulldown"] },

  { id: "row-barbell", name: "Barbell Bent-Over Row", category: "back", met: 5.5, muscles: ["Lats", "Rhomboids", "Rear Deltoids", "Traps"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Stand with feet hip-width apart, bar over the mid-foot.",
    "Hinge at the hips until torso is 30–45° above parallel. Soft bend in the knees.",
    "Grip the bar just outside shoulder width, palms down. Back flat, core braced.",
    "Pull the bar toward your lower ribs / upper abs, driving elbows up and back.",
    "Squeeze the shoulder blades together at the top.",
    "Lower under control to arms extended. Reset for the next rep."
  ], mistakes: ["Rounding the lower back", "Standing more upright each rep", "Yanking with hips (turns into cheat curl)", "Elbows flaring to 90° when they should track ~45°"],
    variations: ["Pendlay row (dead-stop from floor)", "Underhand-grip row", "Snatch-grip row", "Meadows row (single-arm landmine)"],
    alternatives: ["Dumbbell row", "T-bar row", "Chest-supported row", "Seated cable row"] },

  { id: "row-dumbbell", name: "One-Arm Dumbbell Row", category: "back", met: 5.5, muscles: ["Lats", "Rhomboids", "Rear Deltoids"], equipment: "Dumbbell", gear: ["dumbbell"], technique: [
    "Place your left knee and left hand on a flat bench. Right foot planted on the floor.",
    "Hold the dumbbell in your right hand with a neutral grip, arm fully extended.",
    "Set your back flat and parallel to the floor. Core braced.",
    "Row the dumbbell toward your hip, driving the elbow up and back, close to the body.",
    "Squeeze the lat and mid-back at the top.",
    "Lower under control to a full stretch. Switch sides."
  ], mistakes: ["Twisting the torso (using momentum)", "Elbow flaring wide", "Dumbbell path drifting toward the shoulder", "Losing the flat back"],
    variations: ["Kroc row (heavy, high-rep)", "Chest-supported dumbbell row", "Half-kneeling dumbbell row"],
    alternatives: ["Barbell row", "Seated cable row", "T-bar row", "Machine row"] },

  { id: "row-seated-cable", name: "Seated Cable Row", category: "back", met: 5.5, muscles: ["Lats", "Rhomboids", "Rear Deltoids", "Biceps"], equipment: "Cable machine", gear: ["cable"], technique: [
    "Sit with feet on the platform, knees slightly bent. Grip the handle (V-bar most common).",
    "Sit tall with chest up and a slight arch in the lower back.",
    "Start with arms extended and shoulders slightly forward (a controlled stretch).",
    "Retract shoulder blades, then pull the handle to your lower ribs, driving elbows straight back.",
    "Squeeze the mid-back and hold for a beat.",
    "Return under control to full extension without rounding."
  ], mistakes: ["Rocking the torso back and forth", "Rounding the back at extension", "Shrugging at the top", "Yanking with momentum"],
    variations: ["Wide-grip cable row (upper back)", "Single-arm cable row", "Rope cable row (face pull hybrid)"],
    alternatives: ["Barbell row", "Chest-supported row", "Dumbbell row"] },

  { id: "t-bar-row", name: "T-Bar Row", category: "back", met: 5.5, muscles: ["Lats", "Rhomboids", "Traps"], equipment: "T-bar / landmine", gear: ["barbell"], technique: [
    "Straddle the bar. Attach a V-handle around it.",
    "Hinge at the hips to 45°, back flat, chest proud.",
    "Grip the handle firmly and lift so arms are extended and weight is off the floor.",
    "Row the handle to your lower chest / upper abs, driving elbows up.",
    "Squeeze at the top, then lower under control."
  ], mistakes: ["Excessive lower back rounding", "Using leg drive to cheat", "Not resetting between reps", "Loading too heavy"],
    variations: ["Chest-supported T-bar row", "Wide-grip T-bar row"],
    alternatives: ["Barbell row", "Meadows row", "Chest-supported row"] },

  { id: "face-pull", name: "Face Pull", category: "back", met: 5.5, muscles: ["Rear Deltoids", "Rhomboids", "External Rotators"], equipment: "Cable machine", gear: ["cable"], technique: [
    "Set the pulley slightly above head height and attach a rope.",
    "Grip the rope with palms facing each other. Step back until arms are extended with tension on the cable.",
    "Stand tall or take a split stance. Chest up.",
    "Pull the rope toward your forehead, splitting the hands apart so the ends of the rope pass by your ears.",
    "Elbows should stay high and finish level with or slightly above the shoulders.",
    "Squeeze the rear delts and mid-back, then return under control."
  ], mistakes: ["Elbows dropping (turns into a row)", "Using too much weight", "Not externally rotating the shoulders", "Craning the neck forward"],
    variations: ["Band face pull", "High-to-low face pull", "Kneeling face pull"],
    alternatives: ["Reverse pec deck", "Rear-delt dumbbell fly", "Band pull-apart"] },

  { id: "shrug-barbell", name: "Barbell Shrug", category: "back", met: 5.5, muscles: ["Upper Traps"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Stand tall holding a barbell in front of your thighs, arms fully extended.",
    "Feet shoulder-width apart, core braced, chest up.",
    "Elevate the shoulders straight up toward the ears — no rolling.",
    "Hold the peak contraction for 1–2 seconds.",
    "Lower under control to a full stretch."
  ], mistakes: ["Rolling shoulders (no functional benefit)", "Bending elbows", "Using too much weight and shortening range", "Craning the neck"],
    variations: ["Dumbbell shrug", "Trap-bar shrug", "Behind-the-back barbell shrug"],
    alternatives: ["Dumbbell shrug", "Farmer's carry", "Snatch-grip high pull"] },

  { id: "pullover", name: "Dumbbell Pullover", category: "back", met: 5.5, muscles: ["Lats", "Pectorals", "Serratus"], equipment: "Dumbbell", gear: ["dumbbell"], technique: [
    "Lie on a flat bench holding one dumbbell overhead with both hands cupped under the top plate.",
    "Bend elbows slightly and lock them for the whole set.",
    "Lower the dumbbell in an arc behind your head until you feel a big lat and chest stretch.",
    "Pull it back over the chest, keeping the elbow angle constant.",
    "Focus on driving with the lats, not the arms."
  ], mistakes: ["Bending elbows dynamically", "Bridging the hips too much", "Going too heavy and losing shoulder control", "Not stretching fully"],
    variations: ["Barbell pullover", "Cable straight-arm pullover", "Cross-bench pullover"],
    alternatives: ["Straight-arm pulldown", "Lat pulldown", "Cable pullover"] },

  // ============ SHOULDERS ============
  { id: "ohp-barbell", name: "Overhead Press (Barbell)", category: "shoulders", met: 5.5, muscles: ["Anterior Deltoids", "Lateral Deltoids", "Triceps", "Traps"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Set the bar at collarbone height in a rack. Grip just outside shoulder width, wrists stacked over elbows.",
    "Step under the bar, unrack, and take one step back. Feet shoulder-width apart.",
    "Set the bar in the front-rack position with elbows slightly in front of the bar.",
    "Brace core hard, squeeze glutes. Head slightly back to clear the path.",
    "Press the bar straight up. As it passes the forehead, push your head 'through the window' (shrug slightly forward).",
    "Lock out overhead with biceps by the ears.",
    "Lower under control back to the collarbone."
  ], mistakes: ["Pressing the bar around the head instead of moving the head", "Lower back excessive arching", "Not fully locking out overhead", "Losing core brace"],
    variations: ["Push press", "Behind-the-neck press (mobility permitting)", "Paused OHP", "Z-press (seated on floor)"],
    alternatives: ["Dumbbell shoulder press", "Machine shoulder press", "Landmine press", "Arnold press"] },

  { id: "ohp-dumbbell", name: "Dumbbell Shoulder Press", category: "shoulders", met: 5.0, muscles: ["Anterior Deltoids", "Lateral Deltoids", "Triceps"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Sit on a bench with the back pad set to 85–90° (nearly vertical).",
    "Kick the dumbbells up to shoulder level, palms facing forward.",
    "Elbows should be just below the wrists at the start position.",
    "Press up and slightly in until the dumbbells meet lightly over the head.",
    "Do not clank them — maintain constant tension.",
    "Lower under control to the starting position."
  ], mistakes: ["Bench too far reclined (turns into incline press)", "Elbows too far behind at bottom", "Dumbbells crashing at top", "Lower back arching off pad"],
    variations: ["Arnold press", "Neutral-grip dumbbell press", "Single-arm dumbbell press", "Standing dumbbell press"],
    alternatives: ["Barbell OHP", "Machine shoulder press", "Landmine press"] },

  { id: "lateral-raise", name: "Dumbbell Lateral Raise", category: "shoulders", met: 4.5, muscles: ["Lateral Deltoids"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Stand tall with a dumbbell in each hand, arms by your sides, palms facing your thighs.",
    "Slight bend in the elbows. Chest up, shoulders down.",
    "Raise arms out to the sides, leading with the elbows — imagine pouring water out of jugs.",
    "Stop when the arms are level with the shoulders (do not go above).",
    "Pause briefly, then lower under control against gravity.",
    "Keep the shoulders down; do not shrug."
  ], mistakes: ["Using momentum from the hips", "Shrugging (turns it into a trap exercise)", "Going too heavy and losing form", "Raising above shoulder height (impingement risk)"],
    variations: ["Cable lateral raise", "Leaning lateral raise", "Lying dumbbell lateral raise", "3-second eccentric lateral raise"],
    alternatives: ["Machine lateral raise", "Cable lateral raise", "Band lateral raise"] },

  { id: "rear-delt-fly", name: "Rear Delt Fly (Bent-Over)", category: "shoulders", met: 4.5, muscles: ["Rear Deltoids", "Rhomboids"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Hinge at the hips to 45–90°, back flat, holding light dumbbells with palms facing each other.",
    "Slight bend in elbows, locked for the set.",
    "Raise arms out to the sides in a wide arc until level with the shoulders.",
    "Squeeze the rear delts at the top — think 'pinch the shoulder blades'.",
    "Lower under control.",
    "Do not swing or use the torso to lift."
  ], mistakes: ["Using momentum", "Rounding the back", "Turning it into a row (elbows too bent)", "Going too heavy"],
    variations: ["Chest-supported rear delt fly", "Cable rear delt fly", "Machine reverse pec deck"],
    alternatives: ["Face pull", "Band pull-apart", "Reverse pec deck"] },

  { id: "front-raise", name: "Dumbbell Front Raise", category: "shoulders", met: 4.5, muscles: ["Anterior Deltoids"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Stand tall with dumbbells at your thighs, palms facing your body.",
    "Slight bend in the elbows.",
    "Raise one or both arms straight forward to shoulder height.",
    "Pause briefly, then lower under control.",
    "Do not swing the torso."
  ], mistakes: ["Using body english", "Raising above shoulder height", "Going too heavy", "Locking elbows harshly"],
    variations: ["Barbell front raise", "Plate front raise", "Cable front raise", "Alternating front raise"],
    alternatives: ["Cable front raise", "Plate raise", "Landmine press"] },

  { id: "arnold-press", name: "Arnold Press", category: "shoulders", met: 4.5, muscles: ["Anterior Deltoids", "Lateral Deltoids", "Triceps"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Sit on a bench with dumbbells at chin height, palms facing you (as if at the top of a curl).",
    "As you press up, rotate the dumbbells so palms face forward at the top.",
    "Reach full extension overhead.",
    "Reverse the motion smoothly on the way down, ending with palms facing you again.",
    "Maintain core brace and back flat against the pad."
  ], mistakes: ["Rushing the rotation", "Losing scapular position", "Elbows flaring too wide at the bottom", "Bench too reclined"],
    variations: ["Standing Arnold press", "Single-arm Arnold press"],
    alternatives: ["Dumbbell shoulder press", "Barbell OHP", "Machine press"] },

  { id: "upright-row", name: "Upright Row", category: "shoulders", met: 4.5, muscles: ["Lateral Deltoids", "Traps"], equipment: "Barbell / dumbbells / cable", gear: ["dumbbell", "barbell", "cable"], technique: [
    "Stand with feet shoulder-width apart, holding the bar at hips with a shoulder-width or slightly wider overhand grip.",
    "Pull the bar straight up along your body, leading with the elbows.",
    "Stop when the bar is at mid-chest / lower sternum height — do not go higher (impingement risk).",
    "Elbows should be higher than the wrists at the top.",
    "Lower under control to full extension."
  ], mistakes: ["Pulling too high (impingement)", "Narrow grip (wrist strain)", "Using momentum", "Rounding shoulders forward"],
    variations: ["Cable upright row", "Dumbbell upright row", "Wide-grip upright row (safer)"],
    alternatives: ["Lateral raise", "High pull", "Snatch-grip high pull"] },

  { id: "machine-shoulder-press", name: "Machine Shoulder Press", category: "shoulders", met: 4.5, muscles: ["Anterior Deltoids", "Lateral Deltoids", "Triceps"], equipment: "Machine", gear: ["machine"], technique: [
    "Adjust the seat so the handles are at shoulder level.",
    "Sit tall with back against the pad, core braced.",
    "Grip the handles neutrally or with palms forward.",
    "Press up until arms are extended without harsh lockout.",
    "Lower under control to shoulder level.",
    "Do not shrug or bounce."
  ], mistakes: ["Seat too low", "Bouncing weight stack", "Half reps", "Locking out with a jerk"],
    variations: ["Iso-lateral machine press", "Plate-loaded machine press"],
    alternatives: ["Dumbbell shoulder press", "Barbell OHP", "Smith machine press"] },

  // ============ ARMS ============
  { id: "curl-barbell", name: "Barbell Biceps Curl", category: "arms", met: 3.5, muscles: ["Biceps", "Brachialis", "Forearms"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Stand tall with feet shoulder-width apart, holding the bar with an underhand grip at shoulder width.",
    "Elbows pinned to the sides of the torso.",
    "Curl the bar up in an arc, keeping the elbows still — only the forearms should move.",
    "Squeeze the biceps hard at the top.",
    "Lower under control to full extension.",
    "Do not swing the torso or heave with the lower back."
  ], mistakes: ["Swinging with hips / torso", "Elbows drifting forward (front-delt takes over)", "Not extending fully at the bottom", "Wrist bending back at the top"],
    variations: ["EZ-bar curl", "Wide-grip curl (short-head bias)", "Close-grip curl (long-head bias)", "Strict / cheat curl (advanced)"],
    alternatives: ["Dumbbell curl", "Cable curl", "Machine curl"] },

  { id: "curl-dumbbell", name: "Dumbbell Biceps Curl", category: "arms", met: 3.5, muscles: ["Biceps", "Brachialis", "Forearms"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Stand or sit with dumbbells at your sides, palms facing your thighs.",
    "Elbows pinned to the torso.",
    "Curl the dumbbells up, rotating (supinating) the wrists so palms face up as you lift.",
    "Squeeze the biceps at the top.",
    "Lower under control, reversing the wrist rotation.",
    "Fully extend at the bottom."
  ], mistakes: ["Elbows drifting", "Rotating wrists too late or not at all", "Swinging", "Half reps"],
    variations: ["Hammer curl", "Incline dumbbell curl (long-head stretch)", "Concentration curl", "Zottman curl"],
    alternatives: ["Barbell curl", "Cable curl", "Preacher curl"] },

  { id: "hammer-curl", name: "Hammer Curl", category: "arms", met: 3.5, muscles: ["Brachialis", "Biceps", "Brachioradialis"], equipment: "Dumbbells", gear: ["dumbbell"], technique: [
    "Hold dumbbells with a neutral grip (palms facing each other) at your sides.",
    "Elbows pinned. Chest up, core braced.",
    "Curl the dumbbells up without rotating the wrists.",
    "Squeeze at the top, then lower under control.",
    "Full stretch at the bottom."
  ], mistakes: ["Swinging", "Rotating the wrists (turns it into a regular curl)", "Elbows drifting forward"],
    variations: ["Cross-body hammer curl", "Cable rope hammer curl", "Seated hammer curl"],
    alternatives: ["Cable rope curl", "Reverse curl", "Zottman curl"] },

  { id: "preacher-curl", name: "Preacher Curl", category: "arms", met: 3.5, muscles: ["Biceps (short head)", "Brachialis"], equipment: "Barbell / EZ-bar / dumbbells", gear: ["dumbbell", "barbell"], technique: [
    "Sit at a preacher bench with the top of the pad in your armpit, arms extended over it.",
    "Grip the bar with an underhand grip at shoulder width.",
    "Curl the bar up to just short of vertical (stopping short keeps tension).",
    "Squeeze the biceps.",
    "Lower under control to full extension without letting the elbows leave the pad or hyperextending.",
    "Never bounce out of the bottom — risk of biceps tear."
  ], mistakes: ["Bouncing at the bottom (tear risk)", "Elbows lifting off the pad", "Using too much weight", "Curling all the way vertical (loses tension)"],
    variations: ["Single-arm dumbbell preacher curl", "Machine preacher curl", "Reverse-grip preacher curl"],
    alternatives: ["Spider curl", "Incline dumbbell curl", "Machine curl"] },

  { id: "tricep-pushdown", name: "Triceps Pushdown", category: "arms", met: 3.5, muscles: ["Triceps"], equipment: "Cable machine", gear: ["cable"], technique: [
    "Attach a straight bar, V-bar, or rope to a high pulley.",
    "Stand facing the machine. Grip the attachment with elbows pinned at your sides.",
    "Keep the torso slightly forward, chest up.",
    "Push the attachment down by extending the elbows, keeping the upper arms motionless.",
    "Squeeze the triceps at full extension.",
    "Return under control until the forearms are just past parallel to the floor."
  ], mistakes: ["Elbows drifting forward or flaring out", "Using body weight to push the bar down", "Only doing partial reps", "Wrists breaking at the bottom"],
    variations: ["Rope pushdown (split at the bottom for peak contraction)", "V-bar pushdown", "Single-arm reverse-grip pushdown"],
    alternatives: ["Overhead triceps extension", "Skull crusher", "Dip", "Close-grip bench"] },

  { id: "skull-crusher", name: "Skull Crusher (Lying Triceps Extension)", category: "arms", met: 3.5, muscles: ["Triceps (long head)"], equipment: "Barbell / EZ-bar / dumbbells", gear: ["dumbbell", "barbell"], technique: [
    "Lie on a flat bench holding the bar with a shoulder-width overhand grip, arms extended over the chest.",
    "Angle the arms slightly back toward the head (not straight up) to keep tension on the triceps.",
    "Bend only at the elbows, lowering the bar toward your forehead or just past it.",
    "Stop just before the bar touches — control is key.",
    "Extend the elbows to return, keeping the upper arms angled and still."
  ], mistakes: ["Flaring elbows out (loses triceps tension)", "Moving the upper arms (turns into a pullover)", "Going too heavy (elbow strain)", "Bar hitting the forehead"],
    variations: ["EZ-bar skull crusher (wrist friendly)", "Dumbbell skull crusher", "Incline skull crusher", "Rolling dumbbell extension"],
    alternatives: ["Overhead triceps extension", "Close-grip bench press", "Cable overhead extension"] },

  { id: "overhead-tricep-extension", name: "Overhead Triceps Extension", category: "arms", met: 3.5, muscles: ["Triceps (long head)"], equipment: "Dumbbell / cable / rope", gear: ["dumbbell", "cable"], technique: [
    "Sit or stand tall holding a dumbbell overhead with both hands cupped under the top plate.",
    "Upper arms next to the ears, elbows pointed straight up.",
    "Bend the elbows to lower the weight behind the head until you feel a stretch on the triceps.",
    "Keep the upper arms still.",
    "Extend the elbows to press the weight back overhead.",
    "Squeeze the triceps at the top."
  ], mistakes: ["Elbows flaring out", "Upper arms moving", "Arching the lower back", "Going too heavy"],
    variations: ["Cable rope overhead extension", "Single-arm dumbbell overhead extension", "Kneeling cable overhead extension"],
    alternatives: ["Skull crusher", "Triceps pushdown", "Close-grip bench"] },

  { id: "tricep-dip", name: "Triceps Dip", category: "arms", met: 3.5, muscles: ["Triceps", "Anterior Deltoids", "Pecs (minor)"], equipment: "Dip bars / bench", gear: ["none", "dip-bars"], technique: [
    "Grip parallel bars, arms fully extended. Keep the torso upright to bias triceps.",
    "Legs together or crossed, core tight.",
    "Bend the elbows straight back, lowering until the upper arms are parallel to the floor.",
    "Do not flare the elbows outward.",
    "Press up to full extension, squeezing the triceps."
  ], mistakes: ["Leaning forward too much (turns into chest dip)", "Elbows flaring", "Going too deep with poor mobility", "Kipping"],
    variations: ["Weighted triceps dip", "Bench dip (beginner)", "Ring dip", "Machine assisted dip"],
    alternatives: ["Close-grip bench press", "Triceps pushdown", "Skull crusher"] },

  { id: "concentration-curl", name: "Concentration Curl", category: "arms", met: 3.5, muscles: ["Biceps (peak)"], equipment: "Dumbbell", gear: ["dumbbell"], technique: [
    "Sit on a bench, feet wide, holding a dumbbell in one hand.",
    "Rest the working arm's elbow on the inside of the same-side thigh.",
    "Let the arm hang fully extended with the dumbbell.",
    "Curl the dumbbell up, focusing on isolating the biceps.",
    "Squeeze hard at the top.",
    "Lower under control to full stretch."
  ], mistakes: ["Using body english", "Not fully extending", "Elbow lifting off the thigh"],
    variations: ["Cable concentration curl", "Standing concentration curl"],
    alternatives: ["Preacher curl", "Cable curl", "Spider curl"] },

  { id: "wrist-curl", name: "Wrist Curl", category: "arms", met: 3.5, muscles: ["Forearm Flexors"], equipment: "Dumbbells / barbell", gear: ["dumbbell", "barbell"], technique: [
    "Sit on a bench, forearms resting on your thighs with wrists hanging off the knees.",
    "Hold the bar or dumbbells with palms facing up.",
    "Let the wrists extend down under the weight.",
    "Curl the wrists up as high as possible.",
    "Squeeze at the top, then lower under control."
  ], mistakes: ["Using too much weight (limited range)", "Lifting the forearms off the thighs", "Rushing reps"],
    variations: ["Reverse wrist curl (extensors)", "Cable wrist curl", "Behind-the-back barbell wrist curl"],
    alternatives: ["Farmer's carry", "Dead hang", "Wrist roller"] },

  // ============ LEGS ============
  { id: "squat-back", name: "Barbell Back Squat", category: "legs", met: 6.0, muscles: ["Quadriceps", "Glutes", "Hamstrings", "Erectors", "Core"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Set the bar in a rack at chest height. Position it on the upper traps (high bar) or rear delts (low bar).",
    "Grip the bar just outside shoulder width, elbows down and forward.",
    "Unrack, step back 1–2 steps, feet shoulder-width apart, toes turned out 15–30°.",
    "Take a deep breath into the belly and brace hard.",
    "Sit down and back, pushing knees out in line with the toes.",
    "Descend until hips are below the knee crease (below parallel) if mobility allows.",
    "Drive up through the mid-foot, pushing the floor away. Chest stays up.",
    "Lock out hips at the top."
  ], mistakes: ["Knees caving inward", "Heels lifting", "Rounding the lower back at the bottom (butt wink)", "Not hitting depth", "Losing brace mid-rep"],
    variations: ["High-bar squat", "Low-bar squat", "Paused squat", "Box squat", "Tempo squat"],
    alternatives: ["Front squat", "Goblet squat", "Bulgarian split squat", "Leg press", "Hack squat"] },

  { id: "squat-front", name: "Barbell Front Squat", category: "legs", met: 6.0, muscles: ["Quadriceps", "Glutes", "Core", "Upper Back"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Rack the bar across the front of the shoulders. Use either a clean grip (fingertips under bar) or crossed-arm grip.",
    "Keep elbows high — upper arms parallel to the floor.",
    "Feet shoulder-width, toes slightly out.",
    "Descend with an upright torso, sitting between the legs.",
    "Reach full depth (hip crease below knee) if mobility allows.",
    "Drive up through the mid-foot, elbows leading the way.",
    "Maintain a strong front-rack throughout."
  ], mistakes: ["Elbows dropping (bar rolls forward)", "Chest collapsing", "Heels lifting", "Insufficient wrist / shoulder mobility"],
    variations: ["Cross-arm front squat", "Zombie squat (arms extended)", "Paused front squat"],
    alternatives: ["Goblet squat", "Back squat", "Hack squat", "Leg press"] },

  { id: "goblet-squat", name: "Goblet Squat", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes", "Core"], equipment: "Dumbbell / kettlebell", gear: ["dumbbell", "kettlebell"], technique: [
    "Hold a dumbbell or kettlebell vertically at chest height, hands cupping the top.",
    "Feet shoulder-width apart, toes slightly out.",
    "Keep chest up and elbows in.",
    "Descend by pushing hips back and knees out.",
    "Reach full depth with the elbows lightly brushing the inner knees.",
    "Drive up through the mid-foot to the start."
  ], mistakes: ["Elbows collapsing", "Rounding the back", "Knees caving", "Weight too heavy for the range"],
    variations: ["Paused goblet squat", "Goblet cyclist squat (heels elevated)", "Kettlebell goblet squat"],
    alternatives: ["Back squat", "Front squat", "Split squat"] },

  { id: "leg-press", name: "Leg Press", category: "legs", met: 5.0, muscles: ["Quadriceps", "Glutes", "Hamstrings"], equipment: "Machine", gear: ["machine"], technique: [
    "Sit in the machine with hips fully in the seat, back flat against the pad.",
    "Place feet on the platform shoulder-width apart, mid-foot position.",
    "Release the safety catches and hold the handles.",
    "Lower the platform under control until knees reach ~90° or slightly deeper (without lifting the tailbone).",
    "Press through the mid-foot and heels back to nearly extended (do not lock harshly).",
    "Do not let the lower back round off the pad at the bottom."
  ], mistakes: ["Tailbone lifting (butt wink)", "Locking knees violently", "Feet too low (knees over toes excessively)", "Bouncing at the bottom"],
    variations: ["Narrow-stance leg press (quad bias)", "Wide-stance leg press (glute bias)", "Single-leg press", "Feet high (glutes/hams)"],
    alternatives: ["Hack squat", "Back squat", "Bulgarian split squat"] },

  { id: "hack-squat", name: "Hack Squat", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes"], equipment: "Machine", gear: ["machine"], technique: [
    "Load the machine, place shoulders under the pads, back flat against the backrest.",
    "Feet shoulder-width apart on the platform, mid-foot.",
    "Release the safety catches.",
    "Descend by bending knees and hips until thighs are below parallel.",
    "Drive up powerfully through the mid-foot.",
    "Keep the lower back pressed to the pad throughout."
  ], mistakes: ["Feet too low", "Rising onto toes", "Losing back contact with the pad", "Half reps"],
    variations: ["Reverse hack squat (facing pad)", "Single-leg hack squat"],
    alternatives: ["Leg press", "Front squat", "Smith machine squat"] },

  { id: "lunge-walking", name: "Walking Lunge", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"], equipment: "Bodyweight / dumbbells / barbell", gear: ["none", "dumbbell", "barbell"], technique: [
    "Stand tall with weights at your sides or a barbell on your back.",
    "Take a long step forward with one leg.",
    "Lower until the back knee is just above the floor and the front thigh is parallel to the ground.",
    "Front knee should track over the middle of the foot, not past the toes excessively.",
    "Drive up through the front heel and step through with the back leg.",
    "Alternate legs with each step."
  ], mistakes: ["Short stride (knee over toe)", "Torso pitching forward", "Losing balance", "Knee caving inward"],
    variations: ["Reverse lunge", "Curtsy lunge", "Deficit lunge", "Overhead lunge"],
    alternatives: ["Split squat", "Bulgarian split squat", "Step-up"] },

  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes", "Hamstrings"], equipment: "Dumbbells / barbell / bodyweight", gear: ["none", "dumbbell", "barbell"], technique: [
    "Stand about 2 feet in front of a bench, holding dumbbells at your sides.",
    "Place the top of the rear foot on the bench.",
    "Front foot flat, torso upright.",
    "Lower straight down by bending the front knee, until the front thigh is parallel or just past.",
    "Keep the front knee tracking over the middle toes.",
    "Drive up through the front heel to standing.",
    "Complete all reps on one side, then switch."
  ], mistakes: ["Front foot too close (excessive knee travel)", "Pitching forward", "Pushing off the back foot", "Losing balance"],
    variations: ["Front-foot-elevated split squat", "Barbell Bulgarian split squat", "Dumbbell overhead Bulgarian split squat"],
    alternatives: ["Walking lunge", "Step-up", "Single-leg press"] },

  { id: "leg-extension", name: "Leg Extension", category: "legs", met: 5.5, muscles: ["Quadriceps"], equipment: "Machine", gear: ["machine"], technique: [
    "Adjust the seat so the knees align with the pivot point of the machine.",
    "Rest the shin pad on top of the ankles / lower shins.",
    "Grip the handles, sit tall with the back flat against the pad.",
    "Extend the knees to lift the weight until legs are fully straight.",
    "Squeeze the quads at the top for a beat.",
    "Lower under control to a full stretch — but avoid slamming the weight stack."
  ], mistakes: ["Explosive lift with slow lower", "Not extending fully", "Hips lifting off the seat", "Overloading and shortening range"],
    variations: ["Single-leg extension", "Paused leg extension", "1½ rep leg extension"],
    alternatives: ["Sissy squat", "Squat", "Reverse lunge"] },

  { id: "leg-curl-lying", name: "Lying Leg Curl", category: "legs", met: 5.5, muscles: ["Hamstrings"], equipment: "Machine", gear: ["machine"], technique: [
    "Lie face-down on the machine with the knees just past the edge of the pad.",
    "Position the ankle pad just above your heels.",
    "Grip the handles or the edge of the pad.",
    "Curl the heels toward your glutes by contracting the hamstrings.",
    "Squeeze at the top, then lower under control to full extension.",
    "Do not lift the hips off the pad."
  ], mistakes: ["Hips lifting (using momentum)", "Partial range", "Slamming the weight stack down", "Pointing toes strongly (calf takeover)"],
    variations: ["Seated leg curl", "Single-leg curl", "Nordic curl (advanced)"],
    alternatives: ["Nordic curl", "Romanian deadlift", "Glute-ham raise"] },

  { id: "leg-curl-seated", name: "Seated Leg Curl", category: "legs", met: 5.5, muscles: ["Hamstrings"], equipment: "Machine", gear: ["machine"], technique: [
    "Sit on the machine with your knees aligned with the pivot.",
    "Position the ankle pad above your heels and secure the thigh pad.",
    "Grip the handles and sit tall.",
    "Curl the heels back and down toward the machine base.",
    "Squeeze the hamstrings at the bottom.",
    "Return under control to full extension."
  ], mistakes: ["Not extending fully", "Torso leaning back for leverage", "Rushing the eccentric"],
    variations: ["Single-leg seated curl", "Paused seated curl"],
    alternatives: ["Lying leg curl", "Nordic curl", "Romanian deadlift"] },

  { id: "hip-thrust", name: "Barbell Hip Thrust", category: "legs", met: 5.0, muscles: ["Glutes", "Hamstrings"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Sit on the floor with your upper back against a bench, feet flat and shoulder-width apart.",
    "Roll a barbell (padded) over your hips.",
    "Chin tucked, ribs down.",
    "Drive through the heels to lift the hips until the body forms a straight line from shoulders to knees.",
    "Squeeze the glutes hard at the top and pause for 1–2 seconds.",
    "Lower under control until the hips are just above the floor (or touch lightly)."
  ], mistakes: ["Overextending at the top (arching the lower back)", "Feet too far away (hamstring dominant)", "Neck extending back", "Bar rolling from hips"],
    variations: ["Single-leg hip thrust", "Banded hip thrust", "Feet-elevated hip thrust", "Paused hip thrust"],
    alternatives: ["Glute bridge", "Cable pull-through", "Kettlebell swing"] },

  { id: "glute-bridge", name: "Glute Bridge", category: "legs", met: 5.5, muscles: ["Glutes", "Hamstrings"], equipment: "Bodyweight / dumbbell / barbell", gear: ["none", "dumbbell", "barbell"], technique: [
    "Lie on your back with knees bent, feet flat on the floor at hip width.",
    "Arms at your sides, palms down.",
    "Drive through the heels to lift the hips up until knees, hips, and shoulders form a straight line.",
    "Squeeze the glutes at the top.",
    "Lower under control to the start."
  ], mistakes: ["Overextending the lower back", "Feet too far away", "Rushing the reps"],
    variations: ["Single-leg glute bridge", "Weighted glute bridge", "Frog-pump glute bridge"],
    alternatives: ["Hip thrust", "Kettlebell swing", "Cable pull-through"] },

  { id: "calf-raise-standing", name: "Standing Calf Raise", category: "legs", met: 5.5, muscles: ["Gastrocnemius", "Soleus"], equipment: "Machine / dumbbells", gear: ["dumbbell", "machine"], technique: [
    "Stand with the balls of the feet on a raised platform, heels hanging off.",
    "Load with a calf raise machine, dumbbells, or barbell.",
    "Slowly lower the heels until you feel a strong calf stretch.",
    "Drive up onto the balls of the feet as high as possible.",
    "Squeeze the calves at the top for a full 1–2 seconds.",
    "Lower under control back to the stretch."
  ], mistakes: ["Bouncing at the bottom", "Not achieving full range", "Rushing reps", "Uneven weight distribution"],
    variations: ["Single-leg calf raise", "Donkey calf raise", "Toes-in / toes-out calf raise"],
    alternatives: ["Seated calf raise", "Leg press calf raise", "Jump rope"] },

  { id: "calf-raise-seated", name: "Seated Calf Raise", category: "legs", met: 5.5, muscles: ["Soleus"], equipment: "Machine", gear: ["machine"], technique: [
    "Sit on the machine with the balls of your feet on the platform and knees under the pad.",
    "Release the safety.",
    "Lower the heels for a deep stretch.",
    "Press up as high as possible, squeezing the calves.",
    "Pause at the top, then lower under control."
  ], mistakes: ["Partial range", "Bouncing", "Weight too heavy"],
    variations: ["Single-leg seated calf raise"],
    alternatives: ["Standing calf raise", "Leg press calf raise"] },

  { id: "step-up", name: "Dumbbell Step-Up", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes", "Hamstrings"], equipment: "Dumbbells / bodyweight", gear: ["none", "dumbbell"], technique: [
    "Stand in front of a bench or box (knee to mid-thigh height), dumbbells at your sides.",
    "Place one foot fully on the box.",
    "Drive through the heel of the top foot to stand up on the box.",
    "Do NOT push off the bottom foot — the top leg does the work.",
    "Slowly lower the bottom foot back to the floor under control.",
    "Complete reps on one side, then switch."
  ], mistakes: ["Pushing off the bottom foot", "Bouncing", "Foot only partially on the box"],
    variations: ["Lateral step-up", "Crossover step-up", "Weighted vest step-up"],
    alternatives: ["Bulgarian split squat", "Lunge", "Split squat"] },

  { id: "nordic-curl", name: "Nordic Hamstring Curl", category: "legs", met: 5.5, muscles: ["Hamstrings"], equipment: "Bodyweight (partner or anchor)", gear: ["none"], technique: [
    "Kneel on a pad with your ankles anchored (partner holding or under a barbell / GHD pads).",
    "Body upright, hands at your chest.",
    "Slowly lower your torso toward the floor by extending at the knees.",
    "Resist as long as possible using the hamstrings.",
    "Catch yourself with your hands when you can't hold anymore.",
    "Push back up with your hands and hamstrings to the start."
  ], mistakes: ["Not maintaining a straight line hip-to-shoulder", "Falling too quickly", "Bending at the hips"],
    variations: ["Assisted Nordic (with band)", "Slow-tempo Nordic", "Bench-supported Nordic"],
    alternatives: ["Lying leg curl", "Romanian deadlift", "Glute-ham raise"] },

  // ============ CORE ============
  { id: "plank", name: "Plank", category: "core", type: "hold", met: 3.0, muscles: ["Abdominals", "Obliques", "Erectors"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Place forearms on the floor, elbows under the shoulders.",
    "Extend legs behind you, toes on the floor.",
    "Body forms a straight line from head to heels.",
    "Squeeze glutes and quads. Brace the core hard.",
    "Do not sag the hips or pike them up.",
    "Breathe steadily. Hold for the prescribed time."
  ], mistakes: ["Hips sagging or piking", "Head craning up or dropping", "Holding breath"],
    variations: ["Side plank", "Long-lever plank", "Weighted plank", "RKC plank (max tension)"],
    alternatives: ["Dead bug", "Hollow hold", "Ab wheel rollout"] },

  { id: "hanging-leg-raise", name: "Hanging Leg Raise", category: "core", met: 3.8, muscles: ["Lower Abdominals", "Hip Flexors"], equipment: "Pull-up bar", gear: ["pullup-bar"], technique: [
    "Hang from a pull-up bar with an overhand grip, shoulders active.",
    "Brace the core; do not swing.",
    "Raise the legs by tucking the pelvis and lifting the knees / straight legs toward the chest / bar.",
    "Aim to bring the hips up (not just the legs).",
    "Lower under control without swinging.",
    "Reset before the next rep."
  ], mistakes: ["Using momentum / swinging", "Only lifting the knees without pelvic tilt", "Grip failing before abs"],
    variations: ["Toes-to-bar", "L-sit hold", "Knee raise (regression)", "Windshield wipers"],
    alternatives: ["Captain's chair knee raise", "Reverse crunch", "Ab wheel rollout"] },

  { id: "ab-wheel", name: "Ab Wheel Rollout", category: "core", met: 3.8, muscles: ["Abdominals", "Lats", "Shoulders"], equipment: "Ab wheel", gear: ["ab-wheel"], technique: [
    "Kneel on a pad, gripping the ab wheel handles.",
    "Start with the wheel under your shoulders, arms extended.",
    "Brace the core hard and tuck the pelvis.",
    "Roll the wheel forward, extending as far as you can while keeping the lower back neutral.",
    "Stop before the hips sag.",
    "Pull back to the start by contracting the abs and lats."
  ], mistakes: ["Rolling too far and losing back position", "Piking hips up", "Only using the arms to pull back"],
    variations: ["Standing ab wheel rollout (advanced)", "Feet-on-wall rollout", "Elbow rollout regression"],
    alternatives: ["Plank", "Hanging leg raise", "Dragon flag"] },

  { id: "cable-crunch", name: "Cable Crunch", category: "core", met: 3.8, muscles: ["Abdominals"], equipment: "Cable machine", gear: ["cable"], technique: [
    "Attach a rope to a high pulley.",
    "Kneel facing the machine, holding the rope on either side of your head.",
    "Sit back onto your heels with the hips fixed.",
    "Crunch by rounding the upper back and bringing the elbows toward the thighs.",
    "The movement is at the spine, not the hips.",
    "Return under control to a full stretch."
  ], mistakes: ["Bending at the hips instead of crunching", "Using arm pull instead of ab contraction", "Weight too heavy to isolate abs"],
    variations: ["Standing cable crunch", "Kneeling oblique cable crunch"],
    alternatives: ["Weighted crunch", "Ab wheel", "Hanging leg raise"] },

  { id: "russian-twist", name: "Russian Twist", category: "core", met: 3.8, muscles: ["Obliques", "Abdominals"], equipment: "Bodyweight / dumbbell / plate", gear: ["none", "dumbbell", "barbell"], technique: [
    "Sit on the floor with knees bent, heels lightly on the floor or elevated for more challenge.",
    "Lean back to a 45° torso angle. Chest up, spine long.",
    "Hold a weight at chest height with both hands.",
    "Rotate the torso to one side, bringing the weight beside your hip.",
    "Return through the middle and rotate to the other side.",
    "Rotate through the torso, not just the arms."
  ], mistakes: ["Rounding the back", "Only moving the arms", "Rushing reps and losing control"],
    variations: ["Feet-elevated Russian twist", "Medicine ball Russian twist", "Cable Russian twist"],
    alternatives: ["Woodchopper", "Side plank with reach-through", "Pallof press"] },

  { id: "pallof-press", name: "Pallof Press", category: "core", met: 3.8, muscles: ["Obliques", "Deep Core", "Abdominals"], equipment: "Cable / band", gear: ["band", "cable"], technique: [
    "Set a cable to chest height. Grip the handle with both hands at your chest, standing side-on to the machine.",
    "Step away from the machine to create tension. Feet shoulder-width, slight knee bend.",
    "Brace hard — the cable wants to rotate you.",
    "Press the handle straight out in front of your chest.",
    "Resist rotation with your core.",
    "Return the handle to the chest under control. Complete reps, then switch sides."
  ], mistakes: ["Letting the torso rotate", "Pressing too fast", "Holding breath", "Feet too narrow (unstable)"],
    variations: ["Half-kneeling Pallof press", "Tall-kneeling Pallof press", "Pallof press with rotation"],
    alternatives: ["Side plank", "Dead bug", "Bird dog"] },

  { id: "dead-bug", name: "Dead Bug", category: "core", met: 3.8, muscles: ["Deep Core", "Abdominals"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Lie on your back with arms extended straight up over the shoulders and knees over the hips (tabletop).",
    "Press the lower back into the floor. Brace the abs.",
    "Slowly lower the right arm overhead and the left leg toward the floor together.",
    "Stop just before the lower back arches off the floor.",
    "Return to start and switch sides.",
    "Move slowly and breathe."
  ], mistakes: ["Lower back arching off the floor", "Moving too fast", "Holding breath"],
    variations: ["Weighted dead bug", "Banded dead bug", "Dead bug pullover"],
    alternatives: ["Bird dog", "Plank", "Hollow hold"] },

  { id: "hollow-hold", name: "Hollow Body Hold", category: "core", type: "hold", met: 3.5, muscles: ["Abdominals", "Hip Flexors"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Lie on your back with arms extended overhead and legs straight.",
    "Press the lower back firmly into the floor by tilting the pelvis.",
    "Lift arms, head, and legs off the floor to a shallow banana shape.",
    "Point the toes. Squeeze the abs and glutes.",
    "Hold, breathing shallowly. Keep the lower back pinned throughout."
  ], mistakes: ["Lower back lifting off the floor", "Arms and legs too high (loses tension)", "Holding breath"],
    variations: ["Hollow rock", "Tuck hollow hold (regression)", "Weighted hollow hold"],
    alternatives: ["Plank", "Dead bug", "V-up"] },

  { id: "side-plank", name: "Side Plank", category: "core", type: "hold", perSide: true, met: 3.0, muscles: ["Obliques", "Quadratus Lumborum", "Glute Medius"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Lie on your side, forearm on the floor with the elbow directly under the shoulder.",
    "Stack the feet or stagger them for stability.",
    "Lift the hips so the body forms a straight line from head to feet.",
    "Squeeze the glutes and brace the obliques.",
    "Hold for time, then switch sides."
  ], mistakes: ["Hips sagging", "Top hip rolling back", "Head dropping"],
    variations: ["Side plank with hip dip", "Side plank with reach-through", "Weighted side plank", "Star side plank"],
    alternatives: ["Pallof press", "Copenhagen plank", "Suitcase carry"] },

  // ============ CARDIO ============
  { id: "run", name: "Running", category: "cardio", met: 9.8, muscles: ["Cardiovascular system", "Legs", "Core"], equipment: "None / treadmill", gear: ["none", "cardio-machine"], technique: [
    "Land under your center of mass, not out in front of you.",
    "Aim for a cadence of ~170–180 steps per minute.",
    "Keep the torso tall and slightly forward-leaning from the ankles.",
    "Arms swing front-to-back (not across the body), elbows at 90°.",
    "Breathe rhythmically — try 3 steps inhale / 2 steps exhale for easy runs.",
    "Relax the shoulders and hands."
  ], mistakes: ["Overstriding (heel-striking way ahead of the body)", "Slumping", "Arms crossing the midline", "Ramping distance too fast"],
    variations: ["Sprint intervals", "Tempo run", "Long slow distance (LSD)", "Hill sprints"],
    alternatives: ["Rowing", "Cycling", "Assault bike", "Jump rope"] },

  { id: "rowing", name: "Rowing (Erg)", category: "cardio", met: 7.0, muscles: ["Legs", "Back", "Core", "Arms"], equipment: "Rowing machine", gear: ["cardio-machine"], technique: [
    "Sit strapped in, knees bent, shins vertical. Grip the handle just outside the knees.",
    "The Catch: arms extended, torso slightly forward (~1 o'clock).",
    "The Drive: push with the legs first, then swing back the torso, finally pull the handle to just below the sternum.",
    "The Finish: legs extended, torso leaning back slightly, elbows drawn past the ribs.",
    "The Recovery: reverse in order — arms extend, torso hinges forward, then knees bend.",
    "Ratio: 1 second drive, 2 seconds recovery."
  ], mistakes: ["Yanking with arms first", "Locking knees before torso swings", "Rounding the back", "Slamming into the catch"],
    variations: ["Intervals (500m repeats)", "Long steady state", "10-stroke sprints"],
    alternatives: ["Cycling", "Running", "Assault bike"] },

  { id: "cycling", name: "Cycling", category: "cardio", met: 6.8, muscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"], equipment: "Bike / stationary bike", gear: ["cardio-machine"], technique: [
    "Adjust the seat so there is a slight bend in the knee at the bottom of the pedal stroke.",
    "Feet on the pedals with the ball of the foot over the pedal spindle.",
    "Maintain a smooth, circular pedal stroke — push down, pull back, up, and forward.",
    "Cadence of 80–100 rpm for steady state, higher for intervals.",
    "Torso relaxed; grip the handlebars loosely."
  ], mistakes: ["Seat too low (knee strain)", "Bouncing in the saddle at high cadence", "Only pushing down (dead spots in the stroke)"],
    variations: ["Sprint intervals", "Hill climbs", "Steady-state ride", "Spin class"],
    alternatives: ["Rowing", "Running", "Elliptical"] },

  { id: "jump-rope", name: "Jump Rope", category: "cardio", met: 11.0, muscles: ["Calves", "Shoulders", "Cardiovascular system"], equipment: "Jump rope", gear: ["jump-rope"], technique: [
    "Choose a rope so the handles reach your armpits when stepped on at the middle.",
    "Hold the handles with a light grip, elbows close to the body.",
    "Swing the rope with the wrists, not the arms.",
    "Jump 1–2 inches off the ground — just enough to clear the rope.",
    "Land softly on the balls of the feet.",
    "Keep the head up and eyes forward."
  ], mistakes: ["Jumping too high", "Using shoulders instead of wrists", "Looking down at the feet", "Grip too tight"],
    variations: ["Double-unders", "Boxer skip", "High-knee skip", "Criss-cross"],
    alternatives: ["Running", "Rowing", "Burpees"] },

  { id: "burpee", name: "Burpee", category: "full_body", met: 8.0, muscles: ["Full body"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand tall with feet shoulder-width apart.",
    "Squat down and place hands on the floor.",
    "Jump the feet back to a plank / push-up position.",
    "Perform a push-up (optional but standard).",
    "Jump the feet back to the hands.",
    "Explode up into a jump with hands overhead."
  ], mistakes: ["Sagging hips in the plank", "Skipping the push-up if it's part of the standard", "Landing hard from the jump", "Rushing form"],
    variations: ["Burpee to broad jump", "Burpee pull-up", "Half burpee (no push-up)"],
    alternatives: ["Mountain climber", "Squat thrust", "Kettlebell swing"] },

  { id: "kettlebell-swing", name: "Kettlebell Swing", category: "full_body", met: 8.0, muscles: ["Glutes", "Hamstrings", "Erectors", "Shoulders", "Core"], equipment: "Kettlebell", gear: ["kettlebell"], technique: [
    "Stand with feet slightly wider than hips, kettlebell on the floor a foot in front of you.",
    "Hinge at the hips, grip the handle with both hands.",
    "Hike the bell back between your legs like a football snap.",
    "Snap the hips forward explosively — the bell floats up to chest height on its own.",
    "Arms are just guides; do not lift with the shoulders.",
    "Let the bell swing back down as you hinge again, absorbing at the hips.",
    "Squeeze glutes hard at the top."
  ], mistakes: ["Squatting instead of hinging", "Lifting the bell with the shoulders", "Overextending the lower back at the top", "Bell going above head (that's an American swing, controversial)"],
    variations: ["Single-arm KB swing", "American swing (overhead)", "Alternating KB swing"],
    alternatives: ["Barbell hip thrust", "Cable pull-through", "Dumbbell swing"] },

  { id: "stair-climber", name: "Stair Climber", category: "cardio", met: 9.0, muscles: ["Quadriceps", "Glutes", "Calves", "Hamstrings"], equipment: "Stair climber", gear: ["cardio-machine"], technique: [
    "Set a pace you can hold without hanging on — the handrails are for balance, not support.",
    "Stand tall with the chest up; leaning on the console makes the machine far easier and the session pointless.",
    "Plant the whole foot on each step rather than climbing on the toes.",
    "Take full steps and let the leg extend — short choppy steps cut the glutes out.",
    "Raise the speed rather than skipping steps when it starts to feel easy."
  ], mistakes: ["Leaning bodyweight on the handrails", "Climbing on the balls of the feet only", "Tiny partial steps at a high speed", "Gripping the rails to survive an unsustainable pace"],
    variations: ["Weighted vest climb", "Every-other-step climb (bigger range)", "Interval climbs"],
    alternatives: ["Incline treadmill walk", "Hill repeats", "Step-up"] },

  { id: "elliptical", name: "Elliptical", category: "cardio", met: 5.0, muscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"], equipment: "Elliptical", gear: ["cardio-machine"], technique: [
    "Set the resistance high enough that you have to push — spinning freely does very little.",
    "Stand upright and keep the feet flat through the whole stroke.",
    "Drive with the legs and pull with the arms if the machine has moving handles.",
    "Hold a steady cadence rather than surging and coasting.",
    "Low impact by design, so it suits easy days and sore joints."
  ], mistakes: ["Resistance set to almost nothing", "Leaning on the fixed handles", "Bouncing up onto the toes", "Coasting on the machine's momentum"],
    variations: ["Reverse-direction stride", "Arms-only intervals", "High-resistance hill intervals"],
    alternatives: ["Cycling", "Rowing (erg)", "Running"] },

  // ============ FULL BODY / OLYMPIC ============
  { id: "clean-power", name: "Power Clean", category: "full_body", met: 6.5, muscles: ["Full posterior chain", "Traps", "Legs"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Set up like a deadlift: bar over mid-foot, hip-width stance, back flat, hips slightly higher than a deadlift.",
    "First pull: lift the bar off the floor by extending the knees and hips together, keeping the bar close.",
    "Second pull: as the bar passes the knees, drive hips explosively forward and shrug hard.",
    "Pull yourself under the bar, catching it on the front rack in a quarter squat.",
    "Elbows high, chest up in the catch position.",
    "Stand up to lockout. Lower the bar under control or drop it if using bumpers."
  ], mistakes: ["Bar drifting forward on the pull", "Muscling the bar up with the arms (no hip drive)", "Slow rack elbows", "Catching too deep or with elbows down"],
    variations: ["Hang power clean", "Clean pull (no catch)", "Muscle clean"],
    alternatives: ["Kettlebell swing", "High pull", "Trap-bar jump"] },

  { id: "snatch", name: "Barbell Snatch", category: "full_body", met: 6.5, muscles: ["Full body"], equipment: "Barbell", gear: ["barbell"], technique: [
    "Wide grip on the bar (thumbs distance apart or the bar in the hip crease when standing).",
    "Set up: back flat, hips down, arms long.",
    "Pull the bar up in one smooth motion — first pull off the floor, second explosive extension.",
    "Aggressive hip drive and shrug.",
    "Pull yourself under the bar, catching it overhead in a full squat with arms locked out.",
    "Stand up to lockout.",
    "This is a technical lift — get coaching."
  ], mistakes: ["Insufficient overhead mobility", "Muscling with arms", "Bar path away from the body", "Catching with soft arms"],
    variations: ["Hang snatch", "Power snatch (catch above parallel)", "Muscle snatch"],
    alternatives: ["Push press", "Kettlebell snatch", "Dumbbell snatch"] },

  { id: "clean-and-press", name: "Clean and Press", category: "full_body", met: 6.5, muscles: ["Full body"], equipment: "Barbell / dumbbell", gear: ["dumbbell", "barbell"], technique: [
    "Perform a power clean to bring the bar to the front rack.",
    "Reset feet to shoulder-width and take a breath / brace.",
    "Press the bar overhead using a strict OHP or push press.",
    "Lock out with biceps by the ears.",
    "Lower under control back to the shoulders, then to the floor.",
    "Reset each rep."
  ], mistakes: ["Rushing the press before the clean is stable", "Losing rack position", "Pressing with a soft core"],
    variations: ["Dumbbell clean and press", "Kettlebell clean and press", "Push press variant"],
    alternatives: ["Power clean", "OHP", "Landmine press"] },

  { id: "thruster", name: "Thruster", category: "full_body", met: 7.0, muscles: ["Legs", "Shoulders", "Core"], equipment: "Barbell / dumbbells / kettlebells", gear: ["dumbbell", "kettlebell", "barbell"], technique: [
    "Start with the bar in the front rack, elbows high.",
    "Perform a front squat: hips below knee crease.",
    "Drive up powerfully out of the bottom.",
    "Use the momentum from the leg drive to press the bar overhead.",
    "Lock out at the top with biceps by the ears.",
    "Lower back to the front rack and immediately descend into the next squat."
  ], mistakes: ["Pausing at the top of the squat (kills momentum)", "Elbows dropping in the rack", "Pressing without leg drive", "Losing lockout overhead"],
    variations: ["Dumbbell thruster", "Kettlebell thruster", "Single-arm thruster"],
    alternatives: ["Push press", "Front squat + OHP", "Wall ball"] },

  { id: "farmers-carry", name: "Farmer's Carry", category: "full_body", type: "hold", met: 5.5, muscles: ["Grip", "Traps", "Core", "Legs"], equipment: "Dumbbells / kettlebells / handles", gear: ["dumbbell", "kettlebell"], technique: [
    "Deadlift the weights to your sides.",
    "Stand tall — chest up, shoulders back and down.",
    "Brace the core.",
    "Walk with short, controlled steps.",
    "Breathe steadily. Grip hard.",
    "Set down under control at the end of the distance / time."
  ], mistakes: ["Rounding the shoulders", "Rushing / uneven steps", "Weights swinging into legs", "Holding breath"],
    variations: ["Suitcase carry (one side)", "Front-rack carry", "Overhead carry", "Mixed carry"],
    alternatives: ["Kettlebell march", "Sled drag", "Barbell shrug"] },

  { id: "kb-turkish-getup", name: "Turkish Get-Up", category: "full_body", met: 5.0, perSide: true, muscles: ["Shoulders", "Core", "Glutes", "Obliques"], equipment: "Kettlebell", gear: ["kettlebell", "dumbbell"], technique: [
    "Lie on your back with the bell pressed straight up in one hand, that arm locked out.",
    "Bend the same-side knee, foot flat; the free arm rests on the floor at 45°.",
    "Punch the bell up and roll onto the free forearm, then straight onto that hand.",
    "Drive through the planted foot to lift the hips, and sweep the straight leg back into a half-kneel.",
    "Come upright, then reverse every step in order back down to the floor.",
    "The bell stays locked out and directly over the shoulder for the whole rep — eyes on it until standing."
  ], mistakes: ["Rushing the roll-to-elbow", "Letting the loaded arm drift off vertical", "Skipping the leg sweep and scrambling up", "Going heavy before the pattern is grooved"],
    variations: ["Half get-up (stop at the hip bridge)", "Shoe-on-fist get-up (no load)", "Bottoms-up get-up"],
    alternatives: ["Kettlebell windmill", "Pallof press", "Side plank"] },

  { id: "kb-clean-press", name: "Kettlebell Clean & Press", category: "full_body", met: 7.5, perSide: true, muscles: ["Shoulders", "Glutes", "Hamstrings", "Trapezius", "Triceps"], equipment: "Kettlebell", gear: ["kettlebell", "dumbbell"], technique: [
    "Start with the bell between your feet, hips back, chest tall.",
    "Hike it back between the legs, then snap the hips to bring it up close to the body.",
    "Guide your hand around the bell rather than letting it flip over — it should land softly in the front rack.",
    "In the rack the bell rests on the forearm, elbow tight to the ribs, wrist straight.",
    "Brace, then press overhead until the arm is locked out and the biceps is by the ear.",
    "Lower back to the rack, then hinge and hike it into the next rep."
  ], mistakes: ["Bell banging the wrist on the catch", "Pressing with the lower back arched", "Curling the bell up instead of hinging", "Bent wrist in the rack position"],
    variations: ["Double kettlebell clean & press", "Clean & push press", "Dead-stop clean each rep"],
    alternatives: ["Dumbbell clean and press", "Thruster", "Dumbbell shoulder press"] },

  { id: "kb-snatch", name: "Kettlebell Snatch", category: "full_body", met: 9.0, perSide: true, muscles: ["Glutes", "Hamstrings", "Shoulders", "Lower Back", "Trapezius"], equipment: "Kettlebell", gear: ["kettlebell"], technique: [
    "Hike the bell back between the legs as you would for a swing.",
    "Snap the hips hard and pull the bell up close to the body, elbow high.",
    "As it passes head height, punch your hand through so the bell rotates around rather than onto the wrist.",
    "Finish locked out overhead with a straight wrist and the biceps by the ear.",
    "Drop it back into the backswing in one smooth arc — do not lower it slowly.",
    "Keep the whole rep in one plane; the arm guides, the hips do the work."
  ], mistakes: ["Bell flopping onto the wrist at the top", "Muscling it up with the arm", "Losing the lockout overhead", "Rounding the back in the backswing"],
    variations: ["Half snatch (lower to the rack)", "Dead-stop snatch", "Double kettlebell snatch"],
    alternatives: ["Kettlebell swing", "Power clean", "Dumbbell snatch"] },

  { id: "kb-front-rack-carry", name: "Front Rack Carry", category: "full_body", type: "hold", met: 5.5, muscles: ["Core", "Shoulders", "Trapezius", "Quadriceps"], equipment: "Kettlebells", gear: ["kettlebell", "dumbbell"], technique: [
    "Clean one or two bells into the front rack — elbows down and in, wrists straight.",
    "Stand tall with the ribs pulled down; do not let the lower back arch.",
    "Walk with short, controlled steps, breathing shallowly but steadily.",
    "Keep the bells pinned to the chest and forearms rather than propped on the shoulders.",
    "Set them down under control at the end of the distance or time."
  ], mistakes: ["Ribs flared and back arched", "Elbows drifting out wide", "Holding the breath", "Letting the bells slide down"],
    variations: ["Single-bell rack carry", "Double front rack carry", "Rack carry with a march"],
    alternatives: ["Farmer's carry", "Goblet squat hold", "Plank"] },

  { id: "kb-halo", name: "Kettlebell Halo", category: "shoulders", met: 3.5, muscles: ["Deltoids", "Trapezius", "Triceps", "Core"], equipment: "Kettlebell", gear: ["kettlebell", "dumbbell"], technique: [
    "Hold the bell upside down by the horns, close to the chest.",
    "Circle it around your head, keeping it as close as your mobility allows.",
    "Move only the arms — the ribs and hips stay still.",
    "Complete the circle back to the start, then reverse direction.",
    "Go slowly; this is a shoulder warm-up, not a conditioning move."
  ], mistakes: ["Leaning the torso to make the circle", "Bell drifting far from the head", "Going too heavy", "Rushing the reps"],
    variations: ["Half-kneeling halo", "Tall-kneeling halo", "Plate halo"],
    alternatives: ["Arm circles", "Band pull-apart", "Scapular wall slides"] },

  // ============ RESISTANCE BANDS ============
  // Bands load the top of the range rather than the bottom, so reps are usually
  // higher and the useful cue is "control the return", not "chase the weight".

  { id: "band-row", name: "Band Seated Row", category: "back", met: 4.0, muscles: ["Lats", "Rhomboids", "Trapezius", "Biceps"], equipment: "Resistance band", gear: ["band"], technique: [
    "Sit on the floor with legs extended and loop the band around both feet.",
    "Hold an end in each hand, arms straight, chest tall and lower back neutral.",
    "Pull the handles to the ribs, driving the elbows straight back past the torso.",
    "Squeeze the shoulder blades together at the end of the pull.",
    "Return under control until the arms are straight and the shoulder blades spread.",
    "Anchor the band higher or step further back to increase tension."
  ], mistakes: ["Rocking the torso to move the band", "Shrugging at the top", "Letting the band snap back", "Elbows flaring wide"],
    variations: ["Standing band row (door anchor)", "Single-arm band row", "Wide-grip band row"],
    alternatives: ["Seated cable row", "One-arm dumbbell row", "Inverted row"] },

  { id: "band-pulldown", name: "Band Lat Pulldown", category: "back", met: 4.0, muscles: ["Lats", "Teres Major", "Rhomboids", "Biceps"], equipment: "Resistance band", gear: ["band"], technique: [
    "Anchor the band overhead — a door anchor, a beam, or the top of a closed door.",
    "Kneel or stand far enough back that the band is under tension with arms extended.",
    "Start with arms straight overhead and shoulder blades relaxed upward.",
    "Pull the band down and out to chest height, leading with the elbows.",
    "Pause with the shoulder blades depressed and pulled together.",
    "Let the arms rise back overhead slowly — the return is where most of the work is."
  ], mistakes: ["Leaning back to generate range", "Pulling with the hands rather than the elbows", "Shrugging at the bottom", "Losing tension at the top"],
    variations: ["Half-kneeling pulldown", "Straight-arm band pulldown", "Single-arm pulldown"],
    alternatives: ["Lat pulldown", "Pull-up", "Band seated row"] },

  { id: "band-pull-apart", name: "Band Pull-Apart", category: "shoulders", met: 3.5, muscles: ["Rear Deltoids", "Rhomboids", "Trapezius"], equipment: "Resistance band", gear: ["band"], technique: [
    "Hold a light band at shoulder width, arms straight out in front at chest height.",
    "Keep the elbows locked and pull the band apart until it touches the chest.",
    "Squeeze the shoulder blades together without shrugging.",
    "Return slowly to the start, resisting the pull the whole way.",
    "Choose a band light enough to reach the chest for every rep — this is a high-rep move."
  ], mistakes: ["Bending the elbows to cheat range", "Shrugging the shoulders up", "Using a band that is far too heavy", "Letting the band snap back"],
    variations: ["Overhead pull-apart", "Face-pull position (elbows high)", "Single-arm pull-across"],
    alternatives: ["Face pull", "Rear delt fly", "Band row"] },

  { id: "band-chest-press", name: "Band Chest Press", category: "chest", met: 4.5, muscles: ["Pectorals", "Triceps", "Anterior Deltoids"], equipment: "Resistance band", gear: ["band"], technique: [
    "Anchor the band behind you at chest height, or run it across your upper back.",
    "Stand in a split stance with a handle in each hand at chest level, elbows at ~75°.",
    "Press forward and slightly together until the arms are extended.",
    "Squeeze the chest at the end of the press without letting the shoulders roll forward.",
    "Return slowly to a stretch at chest level.",
    "Step further from the anchor to make it harder."
  ], mistakes: ["Band riding up toward the neck", "Elbows flared to 90°", "Leaning forward to finish the press", "Losing the split stance"],
    variations: ["Single-arm press (anti-rotation)", "Incline-angle press (anchor low)", "Band push-up"],
    alternatives: ["Push-up", "Dumbbell bench press", "Machine chest press"] },

  { id: "band-overhead-press", name: "Band Overhead Press", category: "shoulders", met: 4.5, muscles: ["Deltoids", "Triceps", "Upper Pectorals"], equipment: "Resistance band", gear: ["band"], technique: [
    "Stand on the middle of the band with feet hip-width apart.",
    "Hold an end in each hand at shoulder height, palms forward, wrists stacked.",
    "Brace the core and press straight overhead until the arms lock out.",
    "Keep the ribs down — do not lean back to finish the press.",
    "Lower under control to shoulder height.",
    "Stand on the band with both feet, or use a shorter loop, for more tension."
  ], mistakes: ["Arching the lower back at lockout", "Pressing the band in front of the head", "Bent wrists", "Letting the band pull the arms down fast"],
    variations: ["Half-kneeling press", "Single-arm press", "Push press"],
    alternatives: ["Dumbbell shoulder press", "Overhead press (barbell)", "Pike push-up"] },

  { id: "band-squat", name: "Band Squat", category: "legs", met: 5.0, muscles: ["Quadriceps", "Glutes", "Hamstrings"], equipment: "Resistance band", gear: ["band"], technique: [
    "Stand on the middle of the band, feet shoulder-width apart.",
    "Bring the ends over the shoulders and hold them in the front-rack position.",
    "Brace, push the knees out and sit down between the hips.",
    "Descend until the thighs are at least parallel, keeping the chest up.",
    "Drive through mid-foot to stand, resisting the band all the way up.",
    "The band is hardest at the top — do not cut the lockout short."
  ], mistakes: ["Band slipping off the shoulders", "Knees caving inward", "Heels lifting", "Stopping short of full extension"],
    variations: ["Band front squat (bell held at chest)", "Band goblet squat", "Banded split squat"],
    alternatives: ["Goblet squat", "Barbell back squat", "Bodyweight squat"] },

  { id: "band-rdl", name: "Band Romanian Deadlift", category: "legs", met: 4.5, muscles: ["Hamstrings", "Glutes", "Lower Back"], equipment: "Resistance band", gear: ["band"], technique: [
    "Stand on the middle of the band with feet hip-width apart, an end in each hand.",
    "Soften the knees slightly and keep them there for the whole set.",
    "Hinge at the hips, pushing them back and letting the hands travel down the thighs.",
    "Stop when you feel a strong hamstring stretch — the back stays flat throughout.",
    "Drive the hips forward to stand, squeezing the glutes at the top.",
    "Shorten your grip on the band for more tension."
  ], mistakes: ["Rounding the lower back", "Turning it into a squat", "Bouncing at the bottom", "Hyperextending at the top"],
    variations: ["Single-leg band RDL", "Band good morning", "Banded hip hinge for speed"],
    alternatives: ["Romanian deadlift", "Glute bridge", "Nordic hamstring curl"] },

  { id: "band-lateral-walk", name: "Band Lateral Walk", category: "legs", met: 4.0, perSide: true, muscles: ["Gluteus Medius", "Glutes", "Quadriceps"], equipment: "Resistance band", gear: ["band"], technique: [
    "Place a loop band just above the knees, or around the ankles to make it harder.",
    "Set a quarter-squat: hips back, chest up, knees pushed out against the band.",
    "Step sideways with the lead foot, keeping tension on the band.",
    "Follow with the trailing foot but never let the feet touch — keep the stance wide.",
    "Take the prescribed steps one way, then walk back the other.",
    "The feet should stay parallel and pointing forward the whole time."
  ], mistakes: ["Standing up out of the quarter-squat", "Feet clicking together between steps", "Trailing knee caving in", "Rocking the torso side to side"],
    variations: ["Monster walk (diagonal steps)", "Ankle-band walk", "Banded lateral walk in a deeper squat"],
    alternatives: ["Clamshell", "Glute bridge", "Bulgarian split squat"] },

  { id: "band-curl", name: "Band Biceps Curl", category: "arms", met: 3.5, muscles: ["Biceps", "Brachialis", "Forearms"], equipment: "Resistance band", gear: ["band"], technique: [
    "Stand on the middle of the band with feet hip-width apart.",
    "Hold an end in each hand, palms forward, arms straight at your sides.",
    "Curl to the shoulders keeping the elbows pinned against the ribs.",
    "Squeeze hard at the top, where the band tension is highest.",
    "Lower slowly all the way to straight arms.",
    "Widen your stance or shorten your grip for more resistance."
  ], mistakes: ["Elbows drifting forward", "Swinging the torso", "Cutting the bottom of the rep short", "Letting the band recoil fast"],
    variations: ["Hammer-grip band curl", "Single-arm band curl", "21s"],
    alternatives: ["Dumbbell biceps curl", "Chin-up", "Concentration curl"] },

  { id: "band-pushdown", name: "Band Triceps Pushdown", category: "arms", met: 3.5, muscles: ["Triceps"], equipment: "Resistance band", gear: ["band"], technique: [
    "Anchor the band overhead — a door anchor or a bar above head height.",
    "Stand tall with elbows tucked at your sides, forearms up.",
    "Push the band down until the arms are fully straight.",
    "Squeeze the triceps hard at the bottom without leaning over the band.",
    "Let the forearms rise slowly back to the start, elbows staying still.",
    "Step back from the anchor to increase tension."
  ], mistakes: ["Elbows travelling forward or flaring", "Leaning the bodyweight onto the band", "Short, partial reps", "Shrugging the shoulders"],
    variations: ["Rope-style split at the bottom", "Single-arm pushdown", "Overhead band extension"],
    alternatives: ["Triceps pushdown", "Overhead triceps extension", "Triceps dip"] },

  { id: "band-woodchop", name: "Band Woodchop", category: "core", met: 4.0, perSide: true, muscles: ["Obliques", "Abdominals", "Shoulders", "Glutes"], equipment: "Resistance band", gear: ["band"], technique: [
    "Anchor the band high on one side, and stand side-on with feet wider than the shoulders.",
    "Hold the end in both hands, arms nearly straight, up by the far shoulder.",
    "Pull down and across the body toward the opposite hip, pivoting the back foot.",
    "The rotation comes from the hips and mid-back — the arms just hold on.",
    "Return along the same path under control, resisting the band.",
    "Complete all reps on one side before switching."
  ], mistakes: ["Rotating from the lower back only", "Bending the arms and turning it into a pull", "Feet planted flat so the knees twist", "Rushing the return"],
    variations: ["Low-to-high chop (anchor low)", "Half-kneeling chop", "Cable woodchop"],
    alternatives: ["Pallof press", "Russian twist", "Side plank"] },

  // ============ MOBILITY & STRETCHING ============
  // Logged as timed holds (seconds), not sets×reps. `perSide: true` means the
  // hold is performed on each side, so the logged time counts per side.
  { id: "mob-hip-flexor-kneel", name: "Kneeling Hip Flexor Stretch", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Hip Flexors", "Quadriceps"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Kneel on one knee with the other foot flat in front, both knees at about 90°.",
    "Tuck your pelvis under (posterior tilt) — this is what actually creates the stretch.",
    "Squeeze the glute on the kneeling side to deepen it.",
    "Shift your weight gently forward, keeping the torso upright.",
    "Hold and breathe; do not arch the lower back."
  ], mistakes: ["Arching the lower back instead of tucking the pelvis", "Front knee travelling far past the toes", "Leaning the torso forward", "Holding your breath"],
    variations: ["Couch stretch (rear foot elevated)", "Half-kneeling with overhead reach", "Standing lunge stretch"],
    alternatives: ["Couch stretch", "Pigeon pose", "Standing quad stretch"] },

  { id: "mob-hamstring-seated", name: "Seated Hamstring Stretch", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Hamstrings", "Calves"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Sit with one leg extended straight, the other foot tucked to your inner thigh.",
    "Keep the extended leg's kneecap pointing straight up.",
    "Hinge forward from the hips — lead with the chest, not the head.",
    "Reach toward the foot only as far as a mild stretch, never pain.",
    "Hold and breathe, relaxing deeper on each exhale."
  ], mistakes: ["Rounding the upper back to reach further", "Locking the knee aggressively", "Bouncing into the stretch", "Turning the toes outward"],
    variations: ["Standing hamstring stretch", "Supine strap hamstring stretch", "Both legs extended"],
    alternatives: ["Standing forward fold", "Supine hamstring stretch", "Downward dog"] },

  { id: "mob-pigeon", name: "Pigeon Pose", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Glutes", "Hip Flexors"], equipment: "Bodyweight", gear: ["none"], technique: [
    "From all fours, bring one knee forward behind the same-side wrist.",
    "Angle the shin toward the opposite hand — the closer to parallel, the deeper.",
    "Extend the rear leg straight back, hips square to the floor.",
    "Stay upright on the hands, or walk the hands forward and lower the chest.",
    "Support the front hip with a cushion if it does not reach the floor."
  ], mistakes: ["Letting the hips rotate open", "Forcing the front shin parallel too early", "Collapsing onto one side", "Pain in the front knee (back off immediately)"],
    variations: ["Supine figure-4 (easier)", "King pigeon (deeper)", "Seated figure-4"],
    alternatives: ["Supine figure-4 stretch", "Seated glute stretch", "90/90 hip stretch"] },

  { id: "mob-figure-4-supine", name: "Supine Figure-4 Stretch", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Glutes", "Hip Flexors"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Lie on your back with both knees bent, feet flat.",
    "Cross one ankle over the opposite thigh, just above the knee.",
    "Thread your hands behind the supporting thigh and draw it toward your chest.",
    "Gently press the crossed knee away to open the hip.",
    "Keep your head and shoulders relaxed on the floor."
  ], mistakes: ["Lifting the head and shoulders off the floor", "Pulling hard enough to strain the knee", "Holding the breath", "Crossing the ankle onto the kneecap"],
    variations: ["Seated figure-4", "Figure-4 against a wall", "Pigeon pose (deeper)"],
    alternatives: ["Pigeon pose", "Seated glute stretch", "Happy baby"] },

  { id: "mob-quad-standing", name: "Standing Quad Stretch", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Quadriceps", "Hip Flexors"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand tall, holding a wall or rail for balance if needed.",
    "Bend one knee and take hold of that ankle behind you.",
    "Draw the heel toward your glute, keeping the knees side by side.",
    "Tuck the pelvis under and stand tall to deepen the stretch.",
    "Keep the standing leg soft, not locked."
  ], mistakes: ["Letting the bent knee drift out to the side", "Arching the lower back", "Yanking on the ankle", "Leaning far forward"],
    variations: ["Side-lying quad stretch", "Couch stretch", "Prone quad stretch with a strap"],
    alternatives: ["Couch stretch", "Kneeling hip flexor stretch", "Side-lying quad stretch"] },

  { id: "mob-calf-wall", name: "Standing Calf Stretch", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Calves"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand facing a wall, hands at shoulder height.",
    "Step one foot well back, toes pointing straight at the wall.",
    "Keep the rear heel pressed down and that leg straight.",
    "Lean into the wall until you feel the stretch in the upper calf.",
    "For the lower calf/Achilles, bend the rear knee slightly while keeping the heel down."
  ], mistakes: ["Rear heel lifting off the floor", "Rear toes turning outward", "Bouncing", "Rounding the back"],
    variations: ["Bent-knee calf stretch (soleus)", "Step-edge calf drop", "Downward dog pedal"],
    alternatives: ["Downward dog", "Step calf drop", "Seated towel calf stretch"] },

  { id: "mob-childs-pose", name: "Child's Pose", category: "mobility", type: "hold", met: 2.0, perSide: false, muscles: ["Lats", "Lower Back", "Shoulders"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Kneel with your big toes together and knees roughly hip-width (or wider).",
    "Sit your hips back toward your heels.",
    "Walk your hands forward and let your chest sink toward the floor.",
    "Rest your forehead down and let the shoulders relax.",
    "Breathe into your back ribs and lengthen with each exhale."
  ], mistakes: ["Shrugging the shoulders to the ears", "Holding tension in the neck", "Forcing the hips down if knees hurt", "Shallow breathing"],
    variations: ["Wide-knee child's pose", "Side-reach child's pose (lats)", "Supported with a cushion"],
    alternatives: ["Cat-cow", "Puppy pose", "Seated forward fold"] },

  { id: "mob-cat-cow", name: "Cat-Cow", category: "mobility", dynamic: true, type: "hold", met: 2.5, perSide: false, muscles: ["Lower Back", "Upper Back", "Core"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Start on all fours, hands under shoulders and knees under hips.",
    "Inhale: drop the belly, lift the chest and tailbone (cow).",
    "Exhale: round the spine, tuck the tailbone and chin (cat).",
    "Move slowly, one segment of the spine at a time.",
    "Keep the arms straight and the weight even between both hands."
  ], mistakes: ["Moving only from the neck", "Rushing the reps", "Locking the elbows harshly", "Letting the shoulders shrug"],
    variations: ["Thread the needle", "Seated cat-cow", "Standing cat-cow"],
    alternatives: ["Thoracic rotation", "Child's pose", "Standing roll-down"] },

  { id: "mob-thoracic-rotation", name: "Thoracic Rotation (Open Book)", category: "mobility", dynamic: true, type: "hold", met: 2.5, perSide: true, muscles: ["Upper Back", "Pectorals"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Lie on your side with knees bent to 90° and stacked, arms extended in front.",
    "Keep the knees together and pinned to the floor throughout.",
    "Sweep the top arm up and over, opening the chest toward the ceiling.",
    "Follow your hand with your eyes and let the upper back rotate.",
    "Pause where you feel the stretch, then return with control."
  ], mistakes: ["Letting the knees roll open (rotation leaks to the lower back)", "Forcing the shoulder to the floor", "Holding the breath", "Rushing the sweep"],
    variations: ["Quadruped thread the needle", "Seated thoracic rotation", "Half-kneeling rotation"],
    alternatives: ["Thread the needle", "Cat-cow", "Seated spinal twist"] },

  { id: "mob-doorway-chest", name: "Doorway Chest Stretch", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Pectorals", "Anterior Deltoids"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand in a doorway and place your forearm on the frame, elbow at about shoulder height.",
    "Step the same-side foot forward into a small split stance.",
    "Rotate the chest away from that arm until you feel a stretch across the pec.",
    "Keep the shoulder down and back, not shrugged toward the ear.",
    "Adjust elbow height to bias upper or lower pec fibres."
  ], mistakes: ["Shrugging the shoulder", "Over-arching the lower back", "Pushing into shoulder pain", "Elbow far above shoulder height"],
    variations: ["Both arms at once", "Low-elbow (upper pec)", "High-elbow (lower pec)"],
    alternatives: ["Floor pec stretch", "Foam roller chest opener", "Wall chest stretch"] },

  { id: "mob-lat-stretch", name: "Overhead Lat Stretch", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Lats", "Shoulders"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Hold a rack, bar or door frame at about hip-to-chest height with one hand.",
    "Step back and sit your hips down and away from the anchor.",
    "Let the arm straighten and the shoulder open overhead.",
    "Side-bend gently away from the anchored arm to bias the lat.",
    "Keep the ribs down rather than flaring the chest."
  ], mistakes: ["Flaring the ribs and arching the back", "Shrugging into the shoulder", "Gripping too high to hinge properly", "Bouncing"],
    variations: ["Kneeling on a bench", "Both arms overhead", "Child's pose side reach"],
    alternatives: ["Child's pose side reach", "Hanging from a bar", "Foam roller lat stretch"] },

  { id: "mob-shoulder-cross-body", name: "Cross-Body Shoulder Stretch", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Rear Deltoids", "Shoulders"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Bring one arm straight across your chest at shoulder height.",
    "Hook the opposite forearm just above the elbow (not on the joint).",
    "Draw the arm gently in toward the chest.",
    "Keep the shoulder down — resist letting it ride up to the ear.",
    "Stay tall through the spine and breathe."
  ], mistakes: ["Pulling on the elbow joint itself", "Shrugging the stretched shoulder", "Rotating the torso to fake range", "Forcing through pinching pain"],
    variations: ["Sleeper stretch (internal rotation)", "Doorway shoulder stretch", "Behind-the-back towel stretch"],
    alternatives: ["Doorway chest stretch", "Thread the needle", "Band shoulder dislocates"] },

  { id: "mob-triceps-overhead", name: "Overhead Triceps Stretch", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Triceps", "Lats"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Raise one arm overhead and bend the elbow so the hand drops behind your head.",
    "Use the other hand to gently guide the elbow back and in.",
    "Keep the ribs down and the core lightly braced.",
    "Stand tall — avoid arching the lower back to gain range.",
    "Hold where the stretch is felt along the back of the upper arm."
  ], mistakes: ["Arching the lower back", "Cranking hard on the elbow", "Letting the head push forward", "Shrugging the shoulder"],
    variations: ["Towel-assisted behind-the-back", "Both arms (with a strap)", "Wall-supported"],
    alternatives: ["Behind-the-back towel stretch", "Cross-body shoulder stretch", "Wall triceps stretch"] },

  { id: "mob-90-90-hip", name: "90/90 Hip Stretch", category: "mobility", type: "hold", met: 2.5, perSide: true, muscles: ["Glutes", "Hip Flexors"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Sit with the front leg bent 90° in front and the rear leg bent 90° out to the side.",
    "Sit tall on both sit bones — prop on your hands if you cannot stay upright.",
    "For the front-leg glute, hinge the chest forward over the shin.",
    "For the rear-leg hip, stay upright and rotate the torso toward the rear leg.",
    "Switch sides by sweeping the knees across the floor with control."
  ], mistakes: ["Collapsing into a rounded back", "Front ankle rolling over", "Forcing the rear hip down", "Bouncing to gain range"],
    variations: ["90/90 with forward fold", "Supported on a cushion", "90/90 transitions (dynamic)"],
    alternatives: ["Pigeon pose", "Seated figure-4", "Butterfly stretch"] },

  { id: "mob-butterfly", name: "Butterfly Stretch", category: "mobility", type: "hold", met: 2.3, perSide: false, muscles: ["Adductors", "Hip Flexors"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Sit with the soles of your feet together and heels drawn toward you.",
    "Hold your ankles (not your toes) and sit up tall.",
    "Let the knees relax down toward the floor under their own weight.",
    "Hinge forward from the hips for more, keeping the back long.",
    "Sit on a cushion if your lower back rounds."
  ], mistakes: ["Pressing the knees down forcefully", "Rounding the lower back", "Bouncing the knees", "Pulling on the toes"],
    variations: ["Reclined butterfly", "Wall butterfly", "Straddle stretch"],
    alternatives: ["Frog stretch", "Straddle stretch", "90/90 hip stretch"] },

  { id: "mob-couch-stretch", name: "Couch Stretch", category: "mobility", type: "hold", met: 2.5, perSide: true, muscles: ["Hip Flexors", "Quadriceps"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Kneel with your back foot up against a wall or on a low bench, shin vertical.",
    "Place the other foot flat in front in a lunge position.",
    "Tuck your pelvis under and squeeze the rear glute hard.",
    "Come upright slowly — only as tall as you can without arching the back.",
    "Pad the rear knee; back off if you feel knee pain."
  ], mistakes: ["Arching the lower back to sit upright", "Letting the rear glute go slack", "Rushing to full upright", "Ignoring knee pain"],
    variations: ["Floor version (no wall)", "Half-kneeling hip flexor stretch", "With overhead reach"],
    alternatives: ["Kneeling hip flexor stretch", "Standing quad stretch", "Pigeon pose"] },

  { id: "mob-fold-standing", name: "Standing Forward Fold", category: "mobility", type: "hold", met: 2.3, perSide: false, muscles: ["Hamstrings", "Lower Back", "Calves"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand with feet hip-width apart.",
    "Hinge from the hips and fold forward, keeping a soft bend in the knees.",
    "Let the head and arms hang heavy — release the neck completely.",
    "Shift weight slightly into the balls of the feet.",
    "Bend the knees more if the lower back rounds sharply."
  ], mistakes: ["Locking the knees hard", "Yanking the torso down", "Holding tension in the neck", "Rounding from the lower back rather than hinging"],
    variations: ["Ragdoll (elbows clasped)", "Wide-legged fold", "Single-leg fold"],
    alternatives: ["Seated hamstring stretch", "Downward dog", "Supine hamstring stretch"] },

  { id: "mob-downward-dog", name: "Downward Dog", category: "mobility", type: "hold", met: 2.8, perSide: false, muscles: ["Hamstrings", "Calves", "Shoulders", "Lats"], equipment: "Bodyweight", gear: ["none"], technique: [
    "From all fours, tuck the toes and lift the hips up and back.",
    "Press the floor away through the full hand — spread the fingers.",
    "Aim to lengthen the spine first; heels do not need to touch the floor.",
    "Bend the knees generously if the back rounds.",
    "Pedal the feet to stretch each calf in turn."
  ], mistakes: ["Rounding the upper back to force heels down", "Collapsing into the shoulders", "Hands too close to the feet", "Locking the knees"],
    variations: ["Puppy pose (shoulders)", "Three-legged dog", "Pedalling dog"],
    alternatives: ["Standing forward fold", "Calf stretch at a wall", "Child's pose"] },

  { id: "mob-cobra", name: "Cobra Stretch", category: "mobility", type: "hold", met: 2.3, perSide: false, muscles: ["Abdominals", "Hip Flexors", "Pectorals"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Lie face down with hands under your shoulders, elbows tucked in.",
    "Press the tops of the feet and thighs into the floor.",
    "Lift the chest by straightening the arms only as far as is comfortable.",
    "Keep the shoulders down and back, away from the ears.",
    "Lengthen through the top of the head; do not crunch the neck back."
  ], mistakes: ["Cranking the head back", "Shrugging the shoulders", "Pushing into lower-back pinching", "Legs lifting off the floor"],
    variations: ["Sphinx pose (forearms, gentler)", "Baby cobra", "Upward dog (advanced)"],
    alternatives: ["Sphinx pose", "Standing back extension", "Cat-cow"] },

  { id: "mob-neck-lateral", name: "Lateral Neck Stretch", category: "mobility", type: "hold", met: 2.0, perSide: true, muscles: ["Upper Traps", "Shoulders"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Sit or stand tall with the shoulders relaxed and down.",
    "Tilt your ear toward one shoulder without rotating the head.",
    "Let the opposite shoulder stay heavy — you can hold the seat to anchor it.",
    "Rest the same-side hand lightly on the head for a touch more range.",
    "Keep the pressure gentle and the breathing steady."
  ], mistakes: ["Pulling hard on the head", "Shrugging the opposite shoulder", "Rotating instead of tilting", "Rushing between sides"],
    variations: ["Levator scapulae stretch (look to armpit)", "Seated with hand anchored", "Chin-tuck variation"],
    alternatives: ["Upper trap release", "Thread the needle", "Shoulder rolls"] },

  { id: "mob-hip-circles", name: "Standing Hip Circles", category: "mobility", dynamic: true, type: "hold", met: 3.0, perSide: true, muscles: ["Hip Flexors", "Glutes"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand tall, holding a wall or rail for balance.",
    "Lift one knee to about hip height in front of you.",
    "Sweep the knee out to the side, then back and down in a smooth arc.",
    "Keep the standing leg stable and the torso upright.",
    "Reverse the direction for the second half."
  ], mistakes: ["Swinging the leg with momentum", "Leaning the torso to compensate", "Rushing the arc", "Letting the lower back arch"],
    variations: ["Reverse circles", "Lying hip circles", "90/90 transitions"],
    alternatives: ["Leg swings", "World's greatest stretch", "90/90 hip stretch"] },

  { id: "mob-leg-swings", name: "Leg Swings", category: "mobility", dynamic: true, type: "hold", met: 3.0, perSide: true, muscles: ["Hamstrings", "Hip Flexors", "Glutes"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Hold a wall or rail for balance and stand on one leg.",
    "Swing the free leg forward and back in a controlled arc.",
    "Start with a small range and build gradually as it loosens.",
    "Keep the torso upright and the core lightly braced.",
    "Switch to side-to-side swings to open the inner and outer hip."
  ], mistakes: ["Swinging beyond control", "Arching the back to gain height", "Twisting the standing knee", "Starting at full range while cold"],
    variations: ["Lateral leg swings", "Bent-knee swings", "Swings with a rotation"],
    alternatives: ["Hip circles", "World's greatest stretch", "Walking lunges"] },

  { id: "mob-worlds-greatest", name: "World's Greatest Stretch", category: "mobility", dynamic: true, type: "hold", met: 3.2, perSide: true, muscles: ["Hip Flexors", "Hamstrings", "Upper Back", "Glutes"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Step into a deep forward lunge with the front foot flat.",
    "Place both hands on the floor inside the front foot.",
    "Drop the rear knee toward the floor to open the hip flexor.",
    "Rotate the inside arm up toward the ceiling, following it with your eyes.",
    "Return the hand down, then straighten the front leg to stretch the hamstring."
  ], mistakes: ["Front knee collapsing inward", "Rotating from the lower back rather than the upper", "Rushing between positions", "Rear hip sagging out to the side"],
    variations: ["With the rear knee down", "Hold each position statically", "Add a thoracic reach-through"],
    alternatives: ["Thoracic rotation", "Kneeling hip flexor stretch", "Walking lunge with twist"] },

  { id: "mob-arm-circles", name: "Arm Circles", category: "mobility", dynamic: true, type: "hold", met: 2.8, perSide: false, muscles: ["Shoulders", "Pectorals", "Upper Back"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand tall with arms out to the sides at shoulder height.",
    "Draw small circles forward, growing them gradually.",
    "Reverse after half the time, circling backward.",
    "Keep the ribs down and the shoulders away from the ears.",
    "Move continuously — this is to warm the joint, not to stretch it."
  ], mistakes: ["Shrugging the shoulders", "Arching the lower back", "Starting with huge circles while cold", "Holding the breath"],
    variations: ["Single-arm circles", "Circles with a light plate", "Forward/backward alternating"],
    alternatives: ["Band pull-aparts", "Scapular wall slides", "Shoulder dislocates"] },

  { id: "mob-scap-wall-slide", name: "Scapular Wall Slides", category: "mobility", dynamic: true, type: "hold", met: 2.5, perSide: false, muscles: ["Upper Back", "Shoulders", "Upper Traps"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand with your back to a wall, feet a few inches out from it.",
    "Press the lower back, upper back and head lightly into the wall.",
    "Put the backs of the hands and forearms on the wall in a goalpost shape.",
    "Slide the arms overhead, keeping contact with the wall as long as you can.",
    "Lower slowly and repeat, squeezing the shoulder blades down at the bottom."
  ], mistakes: ["Lower back arching off the wall", "Forearms losing contact immediately", "Shrugging at the top", "Rushing the slide"],
    variations: ["Floor version (lying)", "With a band around the wrists", "Half-kneeling at the wall"],
    alternatives: ["Arm circles", "Band pull-aparts", "Thoracic rotation"] },

  { id: "mob-bodyweight-squat", name: "Bodyweight Squat (Warm-up)", category: "mobility", dynamic: true, type: "hold", met: 3.5, perSide: false, muscles: ["Quadriceps", "Glutes", "Hip Flexors", "Adductors"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand with feet about shoulder width, toes slightly out.",
    "Sit down and back, keeping the chest tall and heels planted.",
    "Descend as deep as you can control, knees tracking over the toes.",
    "Drive up through the whole foot without rushing.",
    "Pause a beat at the bottom of the last few to open the hips."
  ], mistakes: ["Heels lifting", "Knees caving inward", "Rounding the lower back at the bottom", "Bouncing out of the hole"],
    variations: ["Prying goblet squat", "Squat to a box", "Squat with an overhead reach"],
    alternatives: ["World's greatest stretch", "Hip circles", "Glute bridge"] },

  { id: "mob-glute-bridge", name: "Glute Bridge (Warm-up)", category: "mobility", dynamic: true, type: "hold", met: 3.0, perSide: false, muscles: ["Glutes", "Hamstrings", "Hip Flexors"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Lie on your back, knees bent, feet flat and hip-width apart.",
    "Tuck the pelvis slightly and brace the core.",
    "Drive through the heels and lift the hips until the body is a straight line.",
    "Squeeze the glutes hard at the top for a beat.",
    "Lower with control — do not let the lower back take over."
  ], mistakes: ["Arching the lower back at the top", "Pushing through the toes", "Rushing the reps", "Letting the knees splay out"],
    variations: ["Single-leg bridge", "Feet elevated", "Bridge with a band around the knees"],
    alternatives: ["Hip circles", "Bodyweight squat", "Kneeling hip flexor stretch"] },

  { id: "mob-inchworm", name: "Inchworm", category: "mobility", dynamic: true, type: "hold", met: 3.5, perSide: false, muscles: ["Hamstrings", "Shoulders", "Core", "Calves"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Stand tall, then hinge and place your hands on the floor (bend the knees as needed).",
    "Walk the hands forward until you reach a high plank.",
    "Hold the plank position for a beat with the ribs down.",
    "Walk the feet up toward the hands in small steps.",
    "Stand up and repeat."
  ], mistakes: ["Hips sagging in the plank", "Locking the knees on the walk-out", "Rushing and losing the brace", "Holding the breath"],
    variations: ["Inchworm with a push-up", "Inchworm with a shoulder tap", "Walk-out only"],
    alternatives: ["Downward dog", "World's greatest stretch", "Standing forward fold"] },

  { id: "mob-ankle-rocks", name: "Ankle Rocks", category: "mobility", dynamic: true, type: "hold", met: 2.3, perSide: true, muscles: ["Calves"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Take a half-kneeling position with the front foot flat.",
    "Keeping the heel down, drive the front knee forward over the toes.",
    "Rock forward to the end of your range, then back.",
    "Work through the range repeatedly rather than holding.",
    "Keep the arch of the front foot from collapsing inward."
  ], mistakes: ["Front heel lifting", "Arch collapsing inward", "Forcing painfully far", "Rocking too fast to feel the range"],
    variations: ["Standing at a wall", "Weighted (hand on the knee)", "Toes elevated"],
    alternatives: ["Standing calf stretch", "Downward dog pedal", "Deep squat hold"] },

  { id: "mob-thread-needle", name: "Thread the Needle", category: "mobility", type: "hold", met: 2.3, perSide: true, muscles: ["Upper Back", "Rear Deltoids", "Lats"], equipment: "Bodyweight", gear: ["none"], technique: [
    "Start on all fours with hands under shoulders.",
    "Slide one arm underneath the body, palm facing up.",
    "Let that shoulder and the side of the head rest on the floor.",
    "Keep the hips stacked over the knees rather than sinking to one side.",
    "Press gently through the supporting hand to deepen the rotation."
  ], mistakes: ["Hips drifting away from over the knees", "Forcing the shoulder into pain", "Holding the breath", "Collapsing the neck"],
    variations: ["With the top arm reaching overhead", "Child's pose thread", "Standing at a wall"],
    alternatives: ["Thoracic rotation", "Child's pose side reach", "Cat-cow"] },

  // ===== Boxing =====
  // Logged by duration, like cardio: rounds are time, and nobody counts
  // punches. `type: "cardio"` is what puts a minutes field on the set row.
  // METs are anchored to the Compendium of Physical Activities — punching bag
  // 5.5, sparring 7.8 — nudged for how these are actually trained: continuous
  // rounds rather than the compendium's lighter general entries.
  { id: "shadow-boxing", name: "Shadow Boxing", category: "boxing", type: "cardio", met: 6.0,
    muscles: ["Shoulders", "Core", "Legs", "Cardiovascular system"], equipment: "None", gear: ["none"], technique: [
    "Stand in your guard: lead foot forward, feet about shoulder-width, weight on the balls of the feet.",
    "Hands up at cheek height, elbows tucked to the ribs, chin down.",
    "Move first, punch second — step, pivot and circle rather than standing square.",
    "Throw combinations at about 70% and snap the hand straight back to the guard.",
    "Turn the hips and pivot the rear foot on the cross; punches come from the ground, not the arm.",
    "Breathe out sharply on every punch and keep the shoulders loose.",
    "Work in rounds — 3 minutes on, 1 minute off is the standard."
  ], mistakes: ["Dropping the hands between combinations", "Punching with the arm only, no hip rotation", "Standing flat-footed", "Holding the breath", "Going full power and burning out in a round"],
    variations: ["Rounds with a focus (jab only, head movement only)", "With light hand weights", "In front of a mirror", "Footwork-only rounds"],
    alternatives: ["Heavy Bag", "Pad Work", "Jump Rope"] },

  { id: "pad-work", name: "Pad Work", category: "boxing", type: "cardio", met: 8.0,
    muscles: ["Shoulders", "Arms", "Core", "Legs", "Cardiovascular system"], equipment: "Focus pads + partner", gear: ["focus-pads"], technique: [
    "Gloves on, hands up — the pad holder calls the combination, you answer it.",
    "Hit through the pad, not at it, and bring the hand straight back to the guard.",
    "Match the holder's rhythm: they set the pace, you stay relayed to it.",
    "Keep moving between combinations rather than resetting to a standstill.",
    "Reset your stance after every combination — do not let the feet cross.",
    "Sharp exhale on each punch; stay relaxed until the moment of contact.",
    "Rounds are usually 2–3 minutes with 30–60 seconds between."
  ], mistakes: ["Pushing punches instead of snapping them", "Watching the pads rather than the holder", "Dropping the non-punching hand", "Squaring up to the holder", "Overreaching and losing balance"],
    variations: ["Fixed combinations", "Call-and-react rounds", "Defence added between combinations", "Conditioning finishers"],
    alternatives: ["Heavy Bag", "Shadow Boxing"] },

  { id: "heavy-bag", name: "Heavy Bag", category: "boxing", type: "cardio", met: 7.0,
    muscles: ["Shoulders", "Arms", "Back", "Core", "Legs", "Cardiovascular system"], equipment: "Heavy bag + gloves", gear: ["heavy-bag"], technique: [
    "Wrap the hands and glove up — the bag is unforgiving on bare knuckles and wrists.",
    "Stay at the range where a straight punch lands just short of full extension.",
    "Land on the flat of the knuckles with a straight wrist; never punch with a bent wrist.",
    "Rotate the hips and pivot the rear foot on power shots.",
    "Circle the bag rather than standing in front of it, and move as it swings back.",
    "Work in rounds and keep the hands up between combinations.",
    "Finish combinations with a step out, not by standing and admiring them."
  ], mistakes: ["Punching with a bent wrist", "Skipping hand wraps", "Standing square in front of the bag", "Leaning on the bag when tired", "Throwing single punches instead of combinations"],
    variations: ["3-minute rounds", "30-second power bursts", "Body-shot rounds", "Jab-only rounds"],
    alternatives: ["Pad Work", "Shadow Boxing"] }
];

// Group by category for quick access
window.EXERCISE_CATEGORIES = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  cardio: "Cardio",
  boxing: "Boxing",
  full_body: "Full Body",
  mobility: "Mobility"
};
