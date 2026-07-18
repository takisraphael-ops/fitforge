// Exercise database — 150+ exercises with technique, variations, and alternatives.
// Categories: chest, back, shoulders, arms, legs, core, cardio, full_body
window.EXERCISE_DB = [
  // ============ CHEST ============
  { id: "bench-press-barbell", name: "Barbell Bench Press", category: "chest", met: 6.0, muscles: ["Pectorals", "Triceps", "Anterior Deltoids"], equipment: "Barbell", technique: [
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

  { id: "bench-press-dumbbell", name: "Dumbbell Bench Press", category: "chest", met: 5.5, muscles: ["Pectorals", "Triceps", "Anterior Deltoids"], equipment: "Dumbbells", technique: [
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

  { id: "incline-bench-barbell", name: "Incline Barbell Bench Press", category: "chest", met: 6.0, muscles: ["Upper Pectorals", "Anterior Deltoids", "Triceps"], equipment: "Barbell", technique: [
    "Set the bench to a 30–45° incline (30° emphasizes chest; steeper shifts to shoulders).",
    "Sit with feet flat, retract shoulder blades, and grip the bar just wider than shoulder width.",
    "Unrack and hold the bar over your upper chest with arms extended.",
    "Lower to the upper chest / collarbone area with elbows at ~65–75°.",
    "Press up in a slight arc toward the rack, locking out over the shoulders.",
    "Keep glutes and shoulders on the bench throughout."
  ], mistakes: ["Bench angle too steep (>45° recruits front delts)", "Bar drifting down to lower chest", "Elbows flaring", "Lifting hips"],
    variations: ["Incline dumbbell press", "Low incline (15–20°)", "Smith machine incline press", "Reverse-grip incline press"],
    alternatives: ["Incline dumbbell press", "Landmine press", "Incline machine press", "Decline push-up"] },

  { id: "incline-bench-dumbbell", name: "Incline Dumbbell Press", category: "chest", met: 5.5, muscles: ["Upper Pectorals", "Anterior Deltoids", "Triceps"], equipment: "Dumbbells", technique: [
    "Set bench to 30°. Sit with dumbbells on thighs.",
    "Kick weights up to shoulders as you lie back.",
    "Palms forward, dumbbells level with upper chest.",
    "Press up and slightly in until arms extended over shoulders.",
    "Lower under control to a deep stretch on the upper chest.",
    "Maintain scapular retraction and stable core."
  ], mistakes: ["Bench too steep", "Dumbbells too far apart at top", "Losing tightness", "Elbows below 60°"],
    variations: ["Neutral-grip incline press", "Alternating incline press", "1½ rep incline press"],
    alternatives: ["Incline barbell press", "Landmine press", "Incline machine press"] },

  { id: "dips-chest", name: "Chest Dip", category: "chest", met: 5.5, muscles: ["Lower Pectorals", "Triceps", "Anterior Deltoids"], equipment: "Dip bars", technique: [
    "Grip parallel bars and support your body with arms extended.",
    "Lean torso forward ~30° to bias the chest (upright biases triceps).",
    "Lower slowly by bending elbows, allowing them to flare slightly outward.",
    "Descend until upper arms are parallel to the floor or you feel a strong chest stretch.",
    "Drive up powerfully through the palms, keeping the forward lean.",
    "Lock out arms without shrugging."
  ], mistakes: ["Staying upright (turns into triceps dip)", "Going too deep with poor mobility", "Kipping / swinging", "Elbows locking harshly"],
    variations: ["Weighted dip (with belt)", "Ring dip", "Bench dip (beginner)", "Assisted dip machine"],
    alternatives: ["Decline bench press", "Push-up", "Cable crossover", "Chest press machine"] },

  { id: "push-up", name: "Push-Up", category: "chest", met: 3.8, muscles: ["Pectorals", "Triceps", "Anterior Deltoids", "Core"], equipment: "Bodyweight", technique: [
    "Place hands slightly wider than shoulder width, fingers spread, on the floor.",
    "Extend legs behind you, toes on the floor. Body forms a straight line from head to heels.",
    "Brace core and glutes. Neck neutral (look at the floor a foot in front of your hands).",
    "Bend elbows to 45–60° from your torso, lowering chest to just above the floor.",
    "Press through the palms back to the start, fully extending elbows without hyperextending.",
    "Maintain the plank line throughout — no hips sagging or piking."
  ], mistakes: ["Sagging hips", "Elbows flared to 90°", "Partial range of motion", "Head craning forward"],
    variations: ["Deficit push-up", "Diamond push-up (triceps)", "Wide push-up", "Archer push-up", "Decline push-up"],
    alternatives: ["Bench press", "Chest dip", "Dumbbell floor press", "Cable chest press"] },

  { id: "cable-crossover", name: "Cable Crossover", category: "chest", met: 5.0, muscles: ["Pectorals (inner and lower)", "Anterior Deltoids"], equipment: "Cable machine", technique: [
    "Set both pulleys to the high position and attach D-handles.",
    "Grab a handle in each hand and step forward into a split stance.",
    "Lean torso forward slightly with a soft bend in the elbows.",
    "With arms in a fixed arc, bring hands down and across in front of your hips.",
    "Squeeze the chest hard at the bottom, hands crossing or touching.",
    "Slowly return along the same arc until you feel a strong chest stretch."
  ], mistakes: ["Bending elbows dynamically (turns into a press)", "Using momentum from the torso", "Standing too upright", "Not squeezing at the bottom"],
    variations: ["Low-to-high cable fly (upper chest)", "Mid-height cable fly", "Single-arm cable crossover"],
    alternatives: ["Dumbbell fly", "Pec deck machine", "Resistance band fly"] },

  { id: "dumbbell-fly", name: "Dumbbell Fly", category: "chest", met: 5.0, muscles: ["Pectorals", "Anterior Deltoids"], equipment: "Dumbbells", technique: [
    "Lie on a flat bench holding dumbbells over your chest, palms facing each other.",
    "Keep a soft bend in the elbows (~15°) and lock that angle for the entire set.",
    "Open the arms outward in a wide arc, lowering until you feel a deep chest stretch.",
    "Stop when upper arms are roughly parallel to the floor — don't overstretch.",
    "Reverse the motion, squeezing the chest to bring dumbbells back over the shoulders.",
    "Never touch the dumbbells at the top; keep tension on the chest."
  ], mistakes: ["Bending elbows dynamically", "Going too heavy (shoulder strain)", "Dropping arms too low", "Touching dumbbells at top"],
    variations: ["Incline dumbbell fly", "Decline dumbbell fly", "Cable fly", "Machine pec deck"],
    alternatives: ["Cable crossover", "Pec deck machine", "Push-up plus"] },

  { id: "machine-chest-press", name: "Machine Chest Press", category: "chest", met: 5.0, muscles: ["Pectorals", "Triceps", "Anterior Deltoids"], equipment: "Machine", technique: [
    "Adjust the seat so the handles align with the middle of your chest.",
    "Sit tall, retract shoulder blades, plant feet firmly.",
    "Grip the handles with wrists neutral, elbows slightly below shoulder height.",
    "Press forward until arms are extended without locking out harshly.",
    "Pause briefly, then return under control to a full chest stretch.",
    "Keep the shoulders back and down throughout."
  ], mistakes: ["Seat set too low (shoulders overwork)", "Flaring shoulders forward at the top", "Bouncing weight stack", "Half-reps"],
    variations: ["Iso-lateral (independent arms)", "Neutral-grip machine press", "Plate-loaded chest press"],
    alternatives: ["Barbell bench press", "Dumbbell bench press", "Cable chest press"] },

  { id: "decline-bench-press", name: "Decline Bench Press", category: "chest", met: 5.0, muscles: ["Lower Pectorals", "Triceps"], equipment: "Barbell", technique: [
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
  { id: "deadlift-conventional", name: "Conventional Deadlift", category: "back", met: 6.0, muscles: ["Erectors", "Glutes", "Hamstrings", "Lats", "Traps"], equipment: "Barbell", technique: [
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

  { id: "deadlift-romanian", name: "Romanian Deadlift (RDL)", category: "back", met: 5.5, muscles: ["Hamstrings", "Glutes", "Erectors"], equipment: "Barbell", technique: [
    "Stand tall holding the bar at hip height, feet hip-width apart, soft knees.",
    "Push hips back as if closing a car door with your butt, letting the bar slide down your thighs.",
    "Keep the bar in contact with your legs and your back flat.",
    "Lower until you feel a deep hamstring stretch (usually mid-shin to just below the knee).",
    "Drive hips forward to return to standing, squeezing glutes at the top.",
    "Do not bend the knees more; the RDL is a hip hinge."
  ], mistakes: ["Squatting instead of hinging", "Rounding the back at the bottom", "Bar drifting away from body", "Overextending at the top"],
    variations: ["Dumbbell RDL", "Single-leg RDL", "Deficit RDL", "Snatch-grip RDL"],
    alternatives: ["Good morning", "Kettlebell swing", "Glute-ham raise", "Cable pull-through"] },

  { id: "pull-up", name: "Pull-Up", category: "back", met: 4.0, muscles: ["Lats", "Biceps", "Rear Deltoids", "Rhomboids"], equipment: "Pull-up bar", technique: [
    "Grip the bar with palms facing away, hands slightly wider than shoulder width.",
    "Hang with arms fully extended, shoulders active (not shrugged into your ears).",
    "Retract shoulder blades first, then pull with your elbows driving down toward your hips.",
    "Lead with your chest and continue pulling until your chin clears the bar.",
    "Squeeze the lats and mid-back at the top for a beat.",
    "Lower under control to a full hang. Reset each rep."
  ], mistakes: ["Kipping / swinging", "Only chin over the bar with no chest lift", "Not lowering fully (partial range)", "Elbows flaring wide instead of down"],
    variations: ["Weighted pull-up", "Wide-grip pull-up", "Neutral-grip pull-up", "L-sit pull-up", "Archer pull-up"],
    alternatives: ["Chin-up", "Lat pulldown", "Assisted pull-up machine", "Inverted row"] },

  { id: "chin-up", name: "Chin-Up", category: "back", met: 4.0, muscles: ["Lats", "Biceps", "Rhomboids"], equipment: "Pull-up bar", technique: [
    "Grip the bar with palms facing you, hands shoulder-width apart.",
    "Hang fully with active shoulders.",
    "Pull with the elbows driving down, keeping the chest proud.",
    "Continue until your chin is above the bar and the chest is close to it.",
    "Lower under control to a full hang."
  ], mistakes: ["Half reps", "Excessive kip", "Shrugging shoulders", "Wrists collapsing"],
    variations: ["Weighted chin-up", "Slow-eccentric chin-up", "Commando (mixed grip)"],
    alternatives: ["Pull-up", "Lat pulldown", "Inverted row"] },

  { id: "lat-pulldown", name: "Lat Pulldown", category: "back", met: 5.5, muscles: ["Lats", "Biceps", "Rhomboids"], equipment: "Cable machine", technique: [
    "Secure knees under the pad and sit tall. Grip the bar wider than shoulder width, palms forward.",
    "Lean torso back ~15° and puff the chest.",
    "Depress and retract the scapula first, then pull the bar to your upper chest.",
    "Focus on driving the elbows down and back, not on pulling with the hands.",
    "Pause when the bar touches the upper chest.",
    "Return under control until arms are fully extended overhead."
  ], mistakes: ["Leaning back too far (turns into a row)", "Pulling with the biceps first", "Not extending fully at the top", "Yanking with momentum"],
    variations: ["Close-grip pulldown", "Neutral-grip pulldown", "Single-arm pulldown", "Reverse-grip pulldown"],
    alternatives: ["Pull-up", "Chin-up", "Machine pullover", "Straight-arm pulldown"] },

  { id: "row-barbell", name: "Barbell Bent-Over Row", category: "back", met: 5.5, muscles: ["Lats", "Rhomboids", "Rear Deltoids", "Traps"], equipment: "Barbell", technique: [
    "Stand with feet hip-width apart, bar over the mid-foot.",
    "Hinge at the hips until torso is 30–45° above parallel. Soft bend in the knees.",
    "Grip the bar just outside shoulder width, palms down. Back flat, core braced.",
    "Pull the bar toward your lower ribs / upper abs, driving elbows up and back.",
    "Squeeze the shoulder blades together at the top.",
    "Lower under control to arms extended. Reset for the next rep."
  ], mistakes: ["Rounding the lower back", "Standing more upright each rep", "Yanking with hips (turns into cheat curl)", "Elbows flaring to 90° when they should track ~45°"],
    variations: ["Pendlay row (dead-stop from floor)", "Underhand-grip row", "Snatch-grip row", "Meadows row (single-arm landmine)"],
    alternatives: ["Dumbbell row", "T-bar row", "Chest-supported row", "Seated cable row"] },

  { id: "row-dumbbell", name: "One-Arm Dumbbell Row", category: "back", met: 5.5, muscles: ["Lats", "Rhomboids", "Rear Deltoids"], equipment: "Dumbbell", technique: [
    "Place your left knee and left hand on a flat bench. Right foot planted on the floor.",
    "Hold the dumbbell in your right hand with a neutral grip, arm fully extended.",
    "Set your back flat and parallel to the floor. Core braced.",
    "Row the dumbbell toward your hip, driving the elbow up and back, close to the body.",
    "Squeeze the lat and mid-back at the top.",
    "Lower under control to a full stretch. Switch sides."
  ], mistakes: ["Twisting the torso (using momentum)", "Elbow flaring wide", "Dumbbell path drifting toward the shoulder", "Losing the flat back"],
    variations: ["Kroc row (heavy, high-rep)", "Chest-supported dumbbell row", "Half-kneeling dumbbell row"],
    alternatives: ["Barbell row", "Seated cable row", "T-bar row", "Machine row"] },

  { id: "row-seated-cable", name: "Seated Cable Row", category: "back", met: 5.5, muscles: ["Lats", "Rhomboids", "Rear Deltoids", "Biceps"], equipment: "Cable machine", technique: [
    "Sit with feet on the platform, knees slightly bent. Grip the handle (V-bar most common).",
    "Sit tall with chest up and a slight arch in the lower back.",
    "Start with arms extended and shoulders slightly forward (a controlled stretch).",
    "Retract shoulder blades, then pull the handle to your lower ribs, driving elbows straight back.",
    "Squeeze the mid-back and hold for a beat.",
    "Return under control to full extension without rounding."
  ], mistakes: ["Rocking the torso back and forth", "Rounding the back at extension", "Shrugging at the top", "Yanking with momentum"],
    variations: ["Wide-grip cable row (upper back)", "Single-arm cable row", "Rope cable row (face pull hybrid)"],
    alternatives: ["Barbell row", "Chest-supported row", "Dumbbell row"] },

  { id: "t-bar-row", name: "T-Bar Row", category: "back", met: 5.5, muscles: ["Lats", "Rhomboids", "Traps"], equipment: "T-bar / landmine", technique: [
    "Straddle the bar. Attach a V-handle around it.",
    "Hinge at the hips to 45°, back flat, chest proud.",
    "Grip the handle firmly and lift so arms are extended and weight is off the floor.",
    "Row the handle to your lower chest / upper abs, driving elbows up.",
    "Squeeze at the top, then lower under control."
  ], mistakes: ["Excessive lower back rounding", "Using leg drive to cheat", "Not resetting between reps", "Loading too heavy"],
    variations: ["Chest-supported T-bar row", "Wide-grip T-bar row"],
    alternatives: ["Barbell row", "Meadows row", "Chest-supported row"] },

  { id: "face-pull", name: "Face Pull", category: "back", met: 5.5, muscles: ["Rear Deltoids", "Rhomboids", "External Rotators"], equipment: "Cable machine", technique: [
    "Set the pulley slightly above head height and attach a rope.",
    "Grip the rope with palms facing each other. Step back until arms are extended with tension on the cable.",
    "Stand tall or take a split stance. Chest up.",
    "Pull the rope toward your forehead, splitting the hands apart so the ends of the rope pass by your ears.",
    "Elbows should stay high and finish level with or slightly above the shoulders.",
    "Squeeze the rear delts and mid-back, then return under control."
  ], mistakes: ["Elbows dropping (turns into a row)", "Using too much weight", "Not externally rotating the shoulders", "Craning the neck forward"],
    variations: ["Band face pull", "High-to-low face pull", "Kneeling face pull"],
    alternatives: ["Reverse pec deck", "Rear-delt dumbbell fly", "Band pull-apart"] },

  { id: "shrug-barbell", name: "Barbell Shrug", category: "back", met: 5.5, muscles: ["Upper Traps"], equipment: "Barbell", technique: [
    "Stand tall holding a barbell in front of your thighs, arms fully extended.",
    "Feet shoulder-width apart, core braced, chest up.",
    "Elevate the shoulders straight up toward the ears — no rolling.",
    "Hold the peak contraction for 1–2 seconds.",
    "Lower under control to a full stretch."
  ], mistakes: ["Rolling shoulders (no functional benefit)", "Bending elbows", "Using too much weight and shortening range", "Craning the neck"],
    variations: ["Dumbbell shrug", "Trap-bar shrug", "Behind-the-back barbell shrug"],
    alternatives: ["Dumbbell shrug", "Farmer's carry", "Snatch-grip high pull"] },

  { id: "pullover", name: "Dumbbell Pullover", category: "back", met: 5.5, muscles: ["Lats", "Pectorals", "Serratus"], equipment: "Dumbbell", technique: [
    "Lie on a flat bench holding one dumbbell overhead with both hands cupped under the top plate.",
    "Bend elbows slightly and lock them for the whole set.",
    "Lower the dumbbell in an arc behind your head until you feel a big lat and chest stretch.",
    "Pull it back over the chest, keeping the elbow angle constant.",
    "Focus on driving with the lats, not the arms."
  ], mistakes: ["Bending elbows dynamically", "Bridging the hips too much", "Going too heavy and losing shoulder control", "Not stretching fully"],
    variations: ["Barbell pullover", "Cable straight-arm pullover", "Cross-bench pullover"],
    alternatives: ["Straight-arm pulldown", "Lat pulldown", "Cable pullover"] },

  // ============ SHOULDERS ============
  { id: "ohp-barbell", name: "Overhead Press (Barbell)", category: "shoulders", met: 5.5, muscles: ["Anterior Deltoids", "Lateral Deltoids", "Triceps", "Traps"], equipment: "Barbell", technique: [
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

  { id: "ohp-dumbbell", name: "Dumbbell Shoulder Press", category: "shoulders", met: 5.0, muscles: ["Anterior Deltoids", "Lateral Deltoids", "Triceps"], equipment: "Dumbbells", technique: [
    "Sit on a bench with the back pad set to 85–90° (nearly vertical).",
    "Kick the dumbbells up to shoulder level, palms facing forward.",
    "Elbows should be just below the wrists at the start position.",
    "Press up and slightly in until the dumbbells meet lightly over the head.",
    "Do not clank them — maintain constant tension.",
    "Lower under control to the starting position."
  ], mistakes: ["Bench too far reclined (turns into incline press)", "Elbows too far behind at bottom", "Dumbbells crashing at top", "Lower back arching off pad"],
    variations: ["Arnold press", "Neutral-grip dumbbell press", "Single-arm dumbbell press", "Standing dumbbell press"],
    alternatives: ["Barbell OHP", "Machine shoulder press", "Landmine press"] },

  { id: "lateral-raise", name: "Dumbbell Lateral Raise", category: "shoulders", met: 4.5, muscles: ["Lateral Deltoids"], equipment: "Dumbbells", technique: [
    "Stand tall with a dumbbell in each hand, arms by your sides, palms facing your thighs.",
    "Slight bend in the elbows. Chest up, shoulders down.",
    "Raise arms out to the sides, leading with the elbows — imagine pouring water out of jugs.",
    "Stop when the arms are level with the shoulders (do not go above).",
    "Pause briefly, then lower under control against gravity.",
    "Keep the shoulders down; do not shrug."
  ], mistakes: ["Using momentum from the hips", "Shrugging (turns it into a trap exercise)", "Going too heavy and losing form", "Raising above shoulder height (impingement risk)"],
    variations: ["Cable lateral raise", "Leaning lateral raise", "Lying dumbbell lateral raise", "3-second eccentric lateral raise"],
    alternatives: ["Machine lateral raise", "Cable lateral raise", "Band lateral raise"] },

  { id: "rear-delt-fly", name: "Rear Delt Fly (Bent-Over)", category: "shoulders", met: 4.5, muscles: ["Rear Deltoids", "Rhomboids"], equipment: "Dumbbells", technique: [
    "Hinge at the hips to 45–90°, back flat, holding light dumbbells with palms facing each other.",
    "Slight bend in elbows, locked for the set.",
    "Raise arms out to the sides in a wide arc until level with the shoulders.",
    "Squeeze the rear delts at the top — think 'pinch the shoulder blades'.",
    "Lower under control.",
    "Do not swing or use the torso to lift."
  ], mistakes: ["Using momentum", "Rounding the back", "Turning it into a row (elbows too bent)", "Going too heavy"],
    variations: ["Chest-supported rear delt fly", "Cable rear delt fly", "Machine reverse pec deck"],
    alternatives: ["Face pull", "Band pull-apart", "Reverse pec deck"] },

  { id: "front-raise", name: "Dumbbell Front Raise", category: "shoulders", met: 4.5, muscles: ["Anterior Deltoids"], equipment: "Dumbbells", technique: [
    "Stand tall with dumbbells at your thighs, palms facing your body.",
    "Slight bend in the elbows.",
    "Raise one or both arms straight forward to shoulder height.",
    "Pause briefly, then lower under control.",
    "Do not swing the torso."
  ], mistakes: ["Using body english", "Raising above shoulder height", "Going too heavy", "Locking elbows harshly"],
    variations: ["Barbell front raise", "Plate front raise", "Cable front raise", "Alternating front raise"],
    alternatives: ["Cable front raise", "Plate raise", "Landmine press"] },

  { id: "arnold-press", name: "Arnold Press", category: "shoulders", met: 4.5, muscles: ["Anterior Deltoids", "Lateral Deltoids", "Triceps"], equipment: "Dumbbells", technique: [
    "Sit on a bench with dumbbells at chin height, palms facing you (as if at the top of a curl).",
    "As you press up, rotate the dumbbells so palms face forward at the top.",
    "Reach full extension overhead.",
    "Reverse the motion smoothly on the way down, ending with palms facing you again.",
    "Maintain core brace and back flat against the pad."
  ], mistakes: ["Rushing the rotation", "Losing scapular position", "Elbows flaring too wide at the bottom", "Bench too reclined"],
    variations: ["Standing Arnold press", "Single-arm Arnold press"],
    alternatives: ["Dumbbell shoulder press", "Barbell OHP", "Machine press"] },

  { id: "upright-row", name: "Upright Row", category: "shoulders", met: 4.5, muscles: ["Lateral Deltoids", "Traps"], equipment: "Barbell / dumbbells / cable", technique: [
    "Stand with feet shoulder-width apart, holding the bar at hips with a shoulder-width or slightly wider overhand grip.",
    "Pull the bar straight up along your body, leading with the elbows.",
    "Stop when the bar is at mid-chest / lower sternum height — do not go higher (impingement risk).",
    "Elbows should be higher than the wrists at the top.",
    "Lower under control to full extension."
  ], mistakes: ["Pulling too high (impingement)", "Narrow grip (wrist strain)", "Using momentum", "Rounding shoulders forward"],
    variations: ["Cable upright row", "Dumbbell upright row", "Wide-grip upright row (safer)"],
    alternatives: ["Lateral raise", "High pull", "Snatch-grip high pull"] },

  { id: "machine-shoulder-press", name: "Machine Shoulder Press", category: "shoulders", met: 4.5, muscles: ["Anterior Deltoids", "Lateral Deltoids", "Triceps"], equipment: "Machine", technique: [
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
  { id: "curl-barbell", name: "Barbell Biceps Curl", category: "arms", met: 3.5, muscles: ["Biceps", "Brachialis", "Forearms"], equipment: "Barbell", technique: [
    "Stand tall with feet shoulder-width apart, holding the bar with an underhand grip at shoulder width.",
    "Elbows pinned to the sides of the torso.",
    "Curl the bar up in an arc, keeping the elbows still — only the forearms should move.",
    "Squeeze the biceps hard at the top.",
    "Lower under control to full extension.",
    "Do not swing the torso or heave with the lower back."
  ], mistakes: ["Swinging with hips / torso", "Elbows drifting forward (front-delt takes over)", "Not extending fully at the bottom", "Wrist bending back at the top"],
    variations: ["EZ-bar curl", "Wide-grip curl (short-head bias)", "Close-grip curl (long-head bias)", "Strict / cheat curl (advanced)"],
    alternatives: ["Dumbbell curl", "Cable curl", "Machine curl"] },

  { id: "curl-dumbbell", name: "Dumbbell Biceps Curl", category: "arms", met: 3.5, muscles: ["Biceps", "Brachialis", "Forearms"], equipment: "Dumbbells", technique: [
    "Stand or sit with dumbbells at your sides, palms facing your thighs.",
    "Elbows pinned to the torso.",
    "Curl the dumbbells up, rotating (supinating) the wrists so palms face up as you lift.",
    "Squeeze the biceps at the top.",
    "Lower under control, reversing the wrist rotation.",
    "Fully extend at the bottom."
  ], mistakes: ["Elbows drifting", "Rotating wrists too late or not at all", "Swinging", "Half reps"],
    variations: ["Hammer curl", "Incline dumbbell curl (long-head stretch)", "Concentration curl", "Zottman curl"],
    alternatives: ["Barbell curl", "Cable curl", "Preacher curl"] },

  { id: "hammer-curl", name: "Hammer Curl", category: "arms", met: 3.5, muscles: ["Brachialis", "Biceps", "Brachioradialis"], equipment: "Dumbbells", technique: [
    "Hold dumbbells with a neutral grip (palms facing each other) at your sides.",
    "Elbows pinned. Chest up, core braced.",
    "Curl the dumbbells up without rotating the wrists.",
    "Squeeze at the top, then lower under control.",
    "Full stretch at the bottom."
  ], mistakes: ["Swinging", "Rotating the wrists (turns it into a regular curl)", "Elbows drifting forward"],
    variations: ["Cross-body hammer curl", "Cable rope hammer curl", "Seated hammer curl"],
    alternatives: ["Cable rope curl", "Reverse curl", "Zottman curl"] },

  { id: "preacher-curl", name: "Preacher Curl", category: "arms", met: 3.5, muscles: ["Biceps (short head)", "Brachialis"], equipment: "Barbell / EZ-bar / dumbbells", technique: [
    "Sit at a preacher bench with the top of the pad in your armpit, arms extended over it.",
    "Grip the bar with an underhand grip at shoulder width.",
    "Curl the bar up to just short of vertical (stopping short keeps tension).",
    "Squeeze the biceps.",
    "Lower under control to full extension without letting the elbows leave the pad or hyperextending.",
    "Never bounce out of the bottom — risk of biceps tear."
  ], mistakes: ["Bouncing at the bottom (tear risk)", "Elbows lifting off the pad", "Using too much weight", "Curling all the way vertical (loses tension)"],
    variations: ["Single-arm dumbbell preacher curl", "Machine preacher curl", "Reverse-grip preacher curl"],
    alternatives: ["Spider curl", "Incline dumbbell curl", "Machine curl"] },

  { id: "tricep-pushdown", name: "Triceps Pushdown", category: "arms", met: 3.5, muscles: ["Triceps"], equipment: "Cable machine", technique: [
    "Attach a straight bar, V-bar, or rope to a high pulley.",
    "Stand facing the machine. Grip the attachment with elbows pinned at your sides.",
    "Keep the torso slightly forward, chest up.",
    "Push the attachment down by extending the elbows, keeping the upper arms motionless.",
    "Squeeze the triceps at full extension.",
    "Return under control until the forearms are just past parallel to the floor."
  ], mistakes: ["Elbows drifting forward or flaring out", "Using body weight to push the bar down", "Only doing partial reps", "Wrists breaking at the bottom"],
    variations: ["Rope pushdown (split at the bottom for peak contraction)", "V-bar pushdown", "Single-arm reverse-grip pushdown"],
    alternatives: ["Overhead triceps extension", "Skull crusher", "Dip", "Close-grip bench"] },

  { id: "skull-crusher", name: "Skull Crusher (Lying Triceps Extension)", category: "arms", met: 3.5, muscles: ["Triceps (long head)"], equipment: "Barbell / EZ-bar / dumbbells", technique: [
    "Lie on a flat bench holding the bar with a shoulder-width overhand grip, arms extended over the chest.",
    "Angle the arms slightly back toward the head (not straight up) to keep tension on the triceps.",
    "Bend only at the elbows, lowering the bar toward your forehead or just past it.",
    "Stop just before the bar touches — control is key.",
    "Extend the elbows to return, keeping the upper arms angled and still."
  ], mistakes: ["Flaring elbows out (loses triceps tension)", "Moving the upper arms (turns into a pullover)", "Going too heavy (elbow strain)", "Bar hitting the forehead"],
    variations: ["EZ-bar skull crusher (wrist friendly)", "Dumbbell skull crusher", "Incline skull crusher", "Rolling dumbbell extension"],
    alternatives: ["Overhead triceps extension", "Close-grip bench press", "Cable overhead extension"] },

  { id: "overhead-tricep-extension", name: "Overhead Triceps Extension", category: "arms", met: 3.5, muscles: ["Triceps (long head)"], equipment: "Dumbbell / cable / rope", technique: [
    "Sit or stand tall holding a dumbbell overhead with both hands cupped under the top plate.",
    "Upper arms next to the ears, elbows pointed straight up.",
    "Bend the elbows to lower the weight behind the head until you feel a stretch on the triceps.",
    "Keep the upper arms still.",
    "Extend the elbows to press the weight back overhead.",
    "Squeeze the triceps at the top."
  ], mistakes: ["Elbows flaring out", "Upper arms moving", "Arching the lower back", "Going too heavy"],
    variations: ["Cable rope overhead extension", "Single-arm dumbbell overhead extension", "Kneeling cable overhead extension"],
    alternatives: ["Skull crusher", "Triceps pushdown", "Close-grip bench"] },

  { id: "tricep-dip", name: "Triceps Dip", category: "arms", met: 3.5, muscles: ["Triceps", "Anterior Deltoids", "Pecs (minor)"], equipment: "Dip bars / bench", technique: [
    "Grip parallel bars, arms fully extended. Keep the torso upright to bias triceps.",
    "Legs together or crossed, core tight.",
    "Bend the elbows straight back, lowering until the upper arms are parallel to the floor.",
    "Do not flare the elbows outward.",
    "Press up to full extension, squeezing the triceps."
  ], mistakes: ["Leaning forward too much (turns into chest dip)", "Elbows flaring", "Going too deep with poor mobility", "Kipping"],
    variations: ["Weighted triceps dip", "Bench dip (beginner)", "Ring dip", "Machine assisted dip"],
    alternatives: ["Close-grip bench press", "Triceps pushdown", "Skull crusher"] },

  { id: "concentration-curl", name: "Concentration Curl", category: "arms", met: 3.5, muscles: ["Biceps (peak)"], equipment: "Dumbbell", technique: [
    "Sit on a bench, feet wide, holding a dumbbell in one hand.",
    "Rest the working arm's elbow on the inside of the same-side thigh.",
    "Let the arm hang fully extended with the dumbbell.",
    "Curl the dumbbell up, focusing on isolating the biceps.",
    "Squeeze hard at the top.",
    "Lower under control to full stretch."
  ], mistakes: ["Using body english", "Not fully extending", "Elbow lifting off the thigh"],
    variations: ["Cable concentration curl", "Standing concentration curl"],
    alternatives: ["Preacher curl", "Cable curl", "Spider curl"] },

  { id: "wrist-curl", name: "Wrist Curl", category: "arms", met: 3.5, muscles: ["Forearm Flexors"], equipment: "Dumbbells / barbell", technique: [
    "Sit on a bench, forearms resting on your thighs with wrists hanging off the knees.",
    "Hold the bar or dumbbells with palms facing up.",
    "Let the wrists extend down under the weight.",
    "Curl the wrists up as high as possible.",
    "Squeeze at the top, then lower under control."
  ], mistakes: ["Using too much weight (limited range)", "Lifting the forearms off the thighs", "Rushing reps"],
    variations: ["Reverse wrist curl (extensors)", "Cable wrist curl", "Behind-the-back barbell wrist curl"],
    alternatives: ["Farmer's carry", "Dead hang", "Wrist roller"] },

  // ============ LEGS ============
  { id: "squat-back", name: "Barbell Back Squat", category: "legs", met: 6.0, muscles: ["Quadriceps", "Glutes", "Hamstrings", "Erectors", "Core"], equipment: "Barbell", technique: [
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

  { id: "squat-front", name: "Barbell Front Squat", category: "legs", met: 6.0, muscles: ["Quadriceps", "Glutes", "Core", "Upper Back"], equipment: "Barbell", technique: [
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

  { id: "goblet-squat", name: "Goblet Squat", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes", "Core"], equipment: "Dumbbell / kettlebell", technique: [
    "Hold a dumbbell or kettlebell vertically at chest height, hands cupping the top.",
    "Feet shoulder-width apart, toes slightly out.",
    "Keep chest up and elbows in.",
    "Descend by pushing hips back and knees out.",
    "Reach full depth with the elbows lightly brushing the inner knees.",
    "Drive up through the mid-foot to the start."
  ], mistakes: ["Elbows collapsing", "Rounding the back", "Knees caving", "Weight too heavy for the range"],
    variations: ["Paused goblet squat", "Goblet cyclist squat (heels elevated)", "Kettlebell goblet squat"],
    alternatives: ["Back squat", "Front squat", "Split squat"] },

  { id: "leg-press", name: "Leg Press", category: "legs", met: 5.0, muscles: ["Quadriceps", "Glutes", "Hamstrings"], equipment: "Machine", technique: [
    "Sit in the machine with hips fully in the seat, back flat against the pad.",
    "Place feet on the platform shoulder-width apart, mid-foot position.",
    "Release the safety catches and hold the handles.",
    "Lower the platform under control until knees reach ~90° or slightly deeper (without lifting the tailbone).",
    "Press through the mid-foot and heels back to nearly extended (do not lock harshly).",
    "Do not let the lower back round off the pad at the bottom."
  ], mistakes: ["Tailbone lifting (butt wink)", "Locking knees violently", "Feet too low (knees over toes excessively)", "Bouncing at the bottom"],
    variations: ["Narrow-stance leg press (quad bias)", "Wide-stance leg press (glute bias)", "Single-leg press", "Feet high (glutes/hams)"],
    alternatives: ["Hack squat", "Back squat", "Bulgarian split squat"] },

  { id: "hack-squat", name: "Hack Squat", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes"], equipment: "Machine", technique: [
    "Load the machine, place shoulders under the pads, back flat against the backrest.",
    "Feet shoulder-width apart on the platform, mid-foot.",
    "Release the safety catches.",
    "Descend by bending knees and hips until thighs are below parallel.",
    "Drive up powerfully through the mid-foot.",
    "Keep the lower back pressed to the pad throughout."
  ], mistakes: ["Feet too low", "Rising onto toes", "Losing back contact with the pad", "Half reps"],
    variations: ["Reverse hack squat (facing pad)", "Single-leg hack squat"],
    alternatives: ["Leg press", "Front squat", "Smith machine squat"] },

  { id: "lunge-walking", name: "Walking Lunge", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"], equipment: "Bodyweight / dumbbells / barbell", technique: [
    "Stand tall with weights at your sides or a barbell on your back.",
    "Take a long step forward with one leg.",
    "Lower until the back knee is just above the floor and the front thigh is parallel to the ground.",
    "Front knee should track over the middle of the foot, not past the toes excessively.",
    "Drive up through the front heel and step through with the back leg.",
    "Alternate legs with each step."
  ], mistakes: ["Short stride (knee over toe)", "Torso pitching forward", "Losing balance", "Knee caving inward"],
    variations: ["Reverse lunge", "Curtsy lunge", "Deficit lunge", "Overhead lunge"],
    alternatives: ["Split squat", "Bulgarian split squat", "Step-up"] },

  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes", "Hamstrings"], equipment: "Dumbbells / barbell / bodyweight", technique: [
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

  { id: "leg-extension", name: "Leg Extension", category: "legs", met: 5.5, muscles: ["Quadriceps"], equipment: "Machine", technique: [
    "Adjust the seat so the knees align with the pivot point of the machine.",
    "Rest the shin pad on top of the ankles / lower shins.",
    "Grip the handles, sit tall with the back flat against the pad.",
    "Extend the knees to lift the weight until legs are fully straight.",
    "Squeeze the quads at the top for a beat.",
    "Lower under control to a full stretch — but avoid slamming the weight stack."
  ], mistakes: ["Explosive lift with slow lower", "Not extending fully", "Hips lifting off the seat", "Overloading and shortening range"],
    variations: ["Single-leg extension", "Paused leg extension", "1½ rep leg extension"],
    alternatives: ["Sissy squat", "Squat", "Reverse lunge"] },

  { id: "leg-curl-lying", name: "Lying Leg Curl", category: "legs", met: 5.5, muscles: ["Hamstrings"], equipment: "Machine", technique: [
    "Lie face-down on the machine with the knees just past the edge of the pad.",
    "Position the ankle pad just above your heels.",
    "Grip the handles or the edge of the pad.",
    "Curl the heels toward your glutes by contracting the hamstrings.",
    "Squeeze at the top, then lower under control to full extension.",
    "Do not lift the hips off the pad."
  ], mistakes: ["Hips lifting (using momentum)", "Partial range", "Slamming the weight stack down", "Pointing toes strongly (calf takeover)"],
    variations: ["Seated leg curl", "Single-leg curl", "Nordic curl (advanced)"],
    alternatives: ["Nordic curl", "Romanian deadlift", "Glute-ham raise"] },

  { id: "leg-curl-seated", name: "Seated Leg Curl", category: "legs", met: 5.5, muscles: ["Hamstrings"], equipment: "Machine", technique: [
    "Sit on the machine with your knees aligned with the pivot.",
    "Position the ankle pad above your heels and secure the thigh pad.",
    "Grip the handles and sit tall.",
    "Curl the heels back and down toward the machine base.",
    "Squeeze the hamstrings at the bottom.",
    "Return under control to full extension."
  ], mistakes: ["Not extending fully", "Torso leaning back for leverage", "Rushing the eccentric"],
    variations: ["Single-leg seated curl", "Paused seated curl"],
    alternatives: ["Lying leg curl", "Nordic curl", "Romanian deadlift"] },

  { id: "hip-thrust", name: "Barbell Hip Thrust", category: "legs", met: 5.0, muscles: ["Glutes", "Hamstrings"], equipment: "Barbell", technique: [
    "Sit on the floor with your upper back against a bench, feet flat and shoulder-width apart.",
    "Roll a barbell (padded) over your hips.",
    "Chin tucked, ribs down.",
    "Drive through the heels to lift the hips until the body forms a straight line from shoulders to knees.",
    "Squeeze the glutes hard at the top and pause for 1–2 seconds.",
    "Lower under control until the hips are just above the floor (or touch lightly)."
  ], mistakes: ["Overextending at the top (arching the lower back)", "Feet too far away (hamstring dominant)", "Neck extending back", "Bar rolling from hips"],
    variations: ["Single-leg hip thrust", "Banded hip thrust", "Feet-elevated hip thrust", "Paused hip thrust"],
    alternatives: ["Glute bridge", "Cable pull-through", "Kettlebell swing"] },

  { id: "glute-bridge", name: "Glute Bridge", category: "legs", met: 5.5, muscles: ["Glutes", "Hamstrings"], equipment: "Bodyweight / dumbbell / barbell", technique: [
    "Lie on your back with knees bent, feet flat on the floor at hip width.",
    "Arms at your sides, palms down.",
    "Drive through the heels to lift the hips up until knees, hips, and shoulders form a straight line.",
    "Squeeze the glutes at the top.",
    "Lower under control to the start."
  ], mistakes: ["Overextending the lower back", "Feet too far away", "Rushing the reps"],
    variations: ["Single-leg glute bridge", "Weighted glute bridge", "Frog-pump glute bridge"],
    alternatives: ["Hip thrust", "Kettlebell swing", "Cable pull-through"] },

  { id: "calf-raise-standing", name: "Standing Calf Raise", category: "legs", met: 5.5, muscles: ["Gastrocnemius", "Soleus"], equipment: "Machine / dumbbells", technique: [
    "Stand with the balls of the feet on a raised platform, heels hanging off.",
    "Load with a calf raise machine, dumbbells, or barbell.",
    "Slowly lower the heels until you feel a strong calf stretch.",
    "Drive up onto the balls of the feet as high as possible.",
    "Squeeze the calves at the top for a full 1–2 seconds.",
    "Lower under control back to the stretch."
  ], mistakes: ["Bouncing at the bottom", "Not achieving full range", "Rushing reps", "Uneven weight distribution"],
    variations: ["Single-leg calf raise", "Donkey calf raise", "Toes-in / toes-out calf raise"],
    alternatives: ["Seated calf raise", "Leg press calf raise", "Jump rope"] },

  { id: "calf-raise-seated", name: "Seated Calf Raise", category: "legs", met: 5.5, muscles: ["Soleus"], equipment: "Machine", technique: [
    "Sit on the machine with the balls of your feet on the platform and knees under the pad.",
    "Release the safety.",
    "Lower the heels for a deep stretch.",
    "Press up as high as possible, squeezing the calves.",
    "Pause at the top, then lower under control."
  ], mistakes: ["Partial range", "Bouncing", "Weight too heavy"],
    variations: ["Single-leg seated calf raise"],
    alternatives: ["Standing calf raise", "Leg press calf raise"] },

  { id: "step-up", name: "Dumbbell Step-Up", category: "legs", met: 5.5, muscles: ["Quadriceps", "Glutes", "Hamstrings"], equipment: "Dumbbells / bodyweight", technique: [
    "Stand in front of a bench or box (knee to mid-thigh height), dumbbells at your sides.",
    "Place one foot fully on the box.",
    "Drive through the heel of the top foot to stand up on the box.",
    "Do NOT push off the bottom foot — the top leg does the work.",
    "Slowly lower the bottom foot back to the floor under control.",
    "Complete reps on one side, then switch."
  ], mistakes: ["Pushing off the bottom foot", "Bouncing", "Foot only partially on the box"],
    variations: ["Lateral step-up", "Crossover step-up", "Weighted vest step-up"],
    alternatives: ["Bulgarian split squat", "Lunge", "Split squat"] },

  { id: "nordic-curl", name: "Nordic Hamstring Curl", category: "legs", met: 5.5, muscles: ["Hamstrings"], equipment: "Bodyweight (partner or anchor)", technique: [
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
  { id: "plank", name: "Plank", category: "core", met: 3.0, muscles: ["Abdominals", "Obliques", "Erectors"], equipment: "Bodyweight", technique: [
    "Place forearms on the floor, elbows under the shoulders.",
    "Extend legs behind you, toes on the floor.",
    "Body forms a straight line from head to heels.",
    "Squeeze glutes and quads. Brace the core hard.",
    "Do not sag the hips or pike them up.",
    "Breathe steadily. Hold for the prescribed time."
  ], mistakes: ["Hips sagging or piking", "Head craning up or dropping", "Holding breath"],
    variations: ["Side plank", "Long-lever plank", "Weighted plank", "RKC plank (max tension)"],
    alternatives: ["Dead bug", "Hollow hold", "Ab wheel rollout"] },

  { id: "hanging-leg-raise", name: "Hanging Leg Raise", category: "core", met: 3.8, muscles: ["Lower Abdominals", "Hip Flexors"], equipment: "Pull-up bar", technique: [
    "Hang from a pull-up bar with an overhand grip, shoulders active.",
    "Brace the core; do not swing.",
    "Raise the legs by tucking the pelvis and lifting the knees / straight legs toward the chest / bar.",
    "Aim to bring the hips up (not just the legs).",
    "Lower under control without swinging.",
    "Reset before the next rep."
  ], mistakes: ["Using momentum / swinging", "Only lifting the knees without pelvic tilt", "Grip failing before abs"],
    variations: ["Toes-to-bar", "L-sit hold", "Knee raise (regression)", "Windshield wipers"],
    alternatives: ["Captain's chair knee raise", "Reverse crunch", "Ab wheel rollout"] },

  { id: "ab-wheel", name: "Ab Wheel Rollout", category: "core", met: 3.8, muscles: ["Abdominals", "Lats", "Shoulders"], equipment: "Ab wheel", technique: [
    "Kneel on a pad, gripping the ab wheel handles.",
    "Start with the wheel under your shoulders, arms extended.",
    "Brace the core hard and tuck the pelvis.",
    "Roll the wheel forward, extending as far as you can while keeping the lower back neutral.",
    "Stop before the hips sag.",
    "Pull back to the start by contracting the abs and lats."
  ], mistakes: ["Rolling too far and losing back position", "Piking hips up", "Only using the arms to pull back"],
    variations: ["Standing ab wheel rollout (advanced)", "Feet-on-wall rollout", "Elbow rollout regression"],
    alternatives: ["Plank", "Hanging leg raise", "Dragon flag"] },

  { id: "cable-crunch", name: "Cable Crunch", category: "core", met: 3.8, muscles: ["Abdominals"], equipment: "Cable machine", technique: [
    "Attach a rope to a high pulley.",
    "Kneel facing the machine, holding the rope on either side of your head.",
    "Sit back onto your heels with the hips fixed.",
    "Crunch by rounding the upper back and bringing the elbows toward the thighs.",
    "The movement is at the spine, not the hips.",
    "Return under control to a full stretch."
  ], mistakes: ["Bending at the hips instead of crunching", "Using arm pull instead of ab contraction", "Weight too heavy to isolate abs"],
    variations: ["Standing cable crunch", "Kneeling oblique cable crunch"],
    alternatives: ["Weighted crunch", "Ab wheel", "Hanging leg raise"] },

  { id: "russian-twist", name: "Russian Twist", category: "core", met: 3.8, muscles: ["Obliques", "Abdominals"], equipment: "Bodyweight / dumbbell / plate", technique: [
    "Sit on the floor with knees bent, heels lightly on the floor or elevated for more challenge.",
    "Lean back to a 45° torso angle. Chest up, spine long.",
    "Hold a weight at chest height with both hands.",
    "Rotate the torso to one side, bringing the weight beside your hip.",
    "Return through the middle and rotate to the other side.",
    "Rotate through the torso, not just the arms."
  ], mistakes: ["Rounding the back", "Only moving the arms", "Rushing reps and losing control"],
    variations: ["Feet-elevated Russian twist", "Medicine ball Russian twist", "Cable Russian twist"],
    alternatives: ["Woodchopper", "Side plank with reach-through", "Pallof press"] },

  { id: "pallof-press", name: "Pallof Press", category: "core", met: 3.8, muscles: ["Obliques", "Deep Core", "Abdominals"], equipment: "Cable / band", technique: [
    "Set a cable to chest height. Grip the handle with both hands at your chest, standing side-on to the machine.",
    "Step away from the machine to create tension. Feet shoulder-width, slight knee bend.",
    "Brace hard — the cable wants to rotate you.",
    "Press the handle straight out in front of your chest.",
    "Resist rotation with your core.",
    "Return the handle to the chest under control. Complete reps, then switch sides."
  ], mistakes: ["Letting the torso rotate", "Pressing too fast", "Holding breath", "Feet too narrow (unstable)"],
    variations: ["Half-kneeling Pallof press", "Tall-kneeling Pallof press", "Pallof press with rotation"],
    alternatives: ["Side plank", "Dead bug", "Bird dog"] },

  { id: "dead-bug", name: "Dead Bug", category: "core", met: 3.8, muscles: ["Deep Core", "Abdominals"], equipment: "Bodyweight", technique: [
    "Lie on your back with arms extended straight up over the shoulders and knees over the hips (tabletop).",
    "Press the lower back into the floor. Brace the abs.",
    "Slowly lower the right arm overhead and the left leg toward the floor together.",
    "Stop just before the lower back arches off the floor.",
    "Return to start and switch sides.",
    "Move slowly and breathe."
  ], mistakes: ["Lower back arching off the floor", "Moving too fast", "Holding breath"],
    variations: ["Weighted dead bug", "Banded dead bug", "Dead bug pullover"],
    alternatives: ["Bird dog", "Plank", "Hollow hold"] },

  { id: "hollow-hold", name: "Hollow Body Hold", category: "core", met: 3.5, muscles: ["Abdominals", "Hip Flexors"], equipment: "Bodyweight", technique: [
    "Lie on your back with arms extended overhead and legs straight.",
    "Press the lower back firmly into the floor by tilting the pelvis.",
    "Lift arms, head, and legs off the floor to a shallow banana shape.",
    "Point the toes. Squeeze the abs and glutes.",
    "Hold, breathing shallowly. Keep the lower back pinned throughout."
  ], mistakes: ["Lower back lifting off the floor", "Arms and legs too high (loses tension)", "Holding breath"],
    variations: ["Hollow rock", "Tuck hollow hold (regression)", "Weighted hollow hold"],
    alternatives: ["Plank", "Dead bug", "V-up"] },

  { id: "side-plank", name: "Side Plank", category: "core", met: 3.0, muscles: ["Obliques", "Quadratus Lumborum", "Glute Medius"], equipment: "Bodyweight", technique: [
    "Lie on your side, forearm on the floor with the elbow directly under the shoulder.",
    "Stack the feet or stagger them for stability.",
    "Lift the hips so the body forms a straight line from head to feet.",
    "Squeeze the glutes and brace the obliques.",
    "Hold for time, then switch sides."
  ], mistakes: ["Hips sagging", "Top hip rolling back", "Head dropping"],
    variations: ["Side plank with hip dip", "Side plank with reach-through", "Weighted side plank", "Star side plank"],
    alternatives: ["Pallof press", "Copenhagen plank", "Suitcase carry"] },

  // ============ CARDIO ============
  { id: "run", name: "Running", category: "cardio", met: 9.8, muscles: ["Cardiovascular system", "Legs", "Core"], equipment: "None / treadmill", technique: [
    "Land under your center of mass, not out in front of you.",
    "Aim for a cadence of ~170–180 steps per minute.",
    "Keep the torso tall and slightly forward-leaning from the ankles.",
    "Arms swing front-to-back (not across the body), elbows at 90°.",
    "Breathe rhythmically — try 3 steps inhale / 2 steps exhale for easy runs.",
    "Relax the shoulders and hands."
  ], mistakes: ["Overstriding (heel-striking way ahead of the body)", "Slumping", "Arms crossing the midline", "Ramping distance too fast"],
    variations: ["Sprint intervals", "Tempo run", "Long slow distance (LSD)", "Hill sprints"],
    alternatives: ["Rowing", "Cycling", "Assault bike", "Jump rope"] },

  { id: "rowing", name: "Rowing (Erg)", category: "cardio", met: 7.0, muscles: ["Legs", "Back", "Core", "Arms"], equipment: "Rowing machine", technique: [
    "Sit strapped in, knees bent, shins vertical. Grip the handle just outside the knees.",
    "The Catch: arms extended, torso slightly forward (~1 o'clock).",
    "The Drive: push with the legs first, then swing back the torso, finally pull the handle to just below the sternum.",
    "The Finish: legs extended, torso leaning back slightly, elbows drawn past the ribs.",
    "The Recovery: reverse in order — arms extend, torso hinges forward, then knees bend.",
    "Ratio: 1 second drive, 2 seconds recovery."
  ], mistakes: ["Yanking with arms first", "Locking knees before torso swings", "Rounding the back", "Slamming into the catch"],
    variations: ["Intervals (500m repeats)", "Long steady state", "10-stroke sprints"],
    alternatives: ["Cycling", "Running", "Assault bike"] },

  { id: "cycling", name: "Cycling", category: "cardio", met: 6.8, muscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"], equipment: "Bike / stationary bike", technique: [
    "Adjust the seat so there is a slight bend in the knee at the bottom of the pedal stroke.",
    "Feet on the pedals with the ball of the foot over the pedal spindle.",
    "Maintain a smooth, circular pedal stroke — push down, pull back, up, and forward.",
    "Cadence of 80–100 rpm for steady state, higher for intervals.",
    "Torso relaxed; grip the handlebars loosely."
  ], mistakes: ["Seat too low (knee strain)", "Bouncing in the saddle at high cadence", "Only pushing down (dead spots in the stroke)"],
    variations: ["Sprint intervals", "Hill climbs", "Steady-state ride", "Spin class"],
    alternatives: ["Rowing", "Running", "Elliptical"] },

  { id: "jump-rope", name: "Jump Rope", category: "cardio", met: 11.0, muscles: ["Calves", "Shoulders", "Cardiovascular system"], equipment: "Jump rope", technique: [
    "Choose a rope so the handles reach your armpits when stepped on at the middle.",
    "Hold the handles with a light grip, elbows close to the body.",
    "Swing the rope with the wrists, not the arms.",
    "Jump 1–2 inches off the ground — just enough to clear the rope.",
    "Land softly on the balls of the feet.",
    "Keep the head up and eyes forward."
  ], mistakes: ["Jumping too high", "Using shoulders instead of wrists", "Looking down at the feet", "Grip too tight"],
    variations: ["Double-unders", "Boxer skip", "High-knee skip", "Criss-cross"],
    alternatives: ["Running", "Rowing", "Burpees"] },

  { id: "burpee", name: "Burpee", category: "cardio", met: 8.0, muscles: ["Full body"], equipment: "Bodyweight", technique: [
    "Stand tall with feet shoulder-width apart.",
    "Squat down and place hands on the floor.",
    "Jump the feet back to a plank / push-up position.",
    "Perform a push-up (optional but standard).",
    "Jump the feet back to the hands.",
    "Explode up into a jump with hands overhead."
  ], mistakes: ["Sagging hips in the plank", "Skipping the push-up if it's part of the standard", "Landing hard from the jump", "Rushing form"],
    variations: ["Burpee to broad jump", "Burpee pull-up", "Half burpee (no push-up)"],
    alternatives: ["Mountain climber", "Squat thrust", "Kettlebell swing"] },

  { id: "kettlebell-swing", name: "Kettlebell Swing", category: "full_body", met: 8.0, muscles: ["Glutes", "Hamstrings", "Erectors", "Shoulders", "Core"], equipment: "Kettlebell", technique: [
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

  // ============ FULL BODY / OLYMPIC ============
  { id: "clean-power", name: "Power Clean", category: "full_body", met: 6.5, muscles: ["Full posterior chain", "Traps", "Legs"], equipment: "Barbell", technique: [
    "Set up like a deadlift: bar over mid-foot, hip-width stance, back flat, hips slightly higher than a deadlift.",
    "First pull: lift the bar off the floor by extending the knees and hips together, keeping the bar close.",
    "Second pull: as the bar passes the knees, drive hips explosively forward and shrug hard.",
    "Pull yourself under the bar, catching it on the front rack in a quarter squat.",
    "Elbows high, chest up in the catch position.",
    "Stand up to lockout. Lower the bar under control or drop it if using bumpers."
  ], mistakes: ["Bar drifting forward on the pull", "Muscling the bar up with the arms (no hip drive)", "Slow rack elbows", "Catching too deep or with elbows down"],
    variations: ["Hang power clean", "Clean pull (no catch)", "Muscle clean"],
    alternatives: ["Kettlebell swing", "High pull", "Trap-bar jump"] },

  { id: "snatch", name: "Barbell Snatch", category: "full_body", met: 6.5, muscles: ["Full body"], equipment: "Barbell", technique: [
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

  { id: "clean-and-press", name: "Clean and Press", category: "full_body", met: 6.5, muscles: ["Full body"], equipment: "Barbell / dumbbell", technique: [
    "Perform a power clean to bring the bar to the front rack.",
    "Reset feet to shoulder-width and take a breath / brace.",
    "Press the bar overhead using a strict OHP or push press.",
    "Lock out with biceps by the ears.",
    "Lower under control back to the shoulders, then to the floor.",
    "Reset each rep."
  ], mistakes: ["Rushing the press before the clean is stable", "Losing rack position", "Pressing with a soft core"],
    variations: ["Dumbbell clean and press", "Kettlebell clean and press", "Push press variant"],
    alternatives: ["Power clean", "OHP", "Landmine press"] },

  { id: "thruster", name: "Thruster", category: "full_body", met: 7.0, muscles: ["Legs", "Shoulders", "Core"], equipment: "Barbell / dumbbells / kettlebells", technique: [
    "Start with the bar in the front rack, elbows high.",
    "Perform a front squat: hips below knee crease.",
    "Drive up powerfully out of the bottom.",
    "Use the momentum from the leg drive to press the bar overhead.",
    "Lock out at the top with biceps by the ears.",
    "Lower back to the front rack and immediately descend into the next squat."
  ], mistakes: ["Pausing at the top of the squat (kills momentum)", "Elbows dropping in the rack", "Pressing without leg drive", "Losing lockout overhead"],
    variations: ["Dumbbell thruster", "Kettlebell thruster", "Single-arm thruster"],
    alternatives: ["Push press", "Front squat + OHP", "Wall ball"] },

  { id: "farmers-carry", name: "Farmer's Carry", category: "full_body", met: 5.5, muscles: ["Grip", "Traps", "Core", "Legs"], equipment: "Dumbbells / kettlebells / handles", technique: [
    "Deadlift the weights to your sides.",
    "Stand tall — chest up, shoulders back and down.",
    "Brace the core.",
    "Walk with short, controlled steps.",
    "Breathe steadily. Grip hard.",
    "Set down under control at the end of the distance / time."
  ], mistakes: ["Rounding the shoulders", "Rushing / uneven steps", "Weights swinging into legs", "Holding breath"],
    variations: ["Suitcase carry (one side)", "Front-rack carry", "Overhead carry", "Mixed carry"],
    alternatives: ["Kettlebell march", "Sled drag", "Barbell shrug"] }
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
  full_body: "Full Body"
};
