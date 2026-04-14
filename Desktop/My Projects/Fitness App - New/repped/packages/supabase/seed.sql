-- =============================================================================
-- Repped Exercise Library Seed Data
-- ~120 exercises across 11 muscle groups, 3 difficulty levels
-- =============================================================================
-- Equipment values: barbell, dumbbell, cable, machine, bodyweight, kettlebell, band, bench
-- Equipment mapping:
--   full_gym:       all equipment
--   dumbbells_only: dumbbell, bodyweight, band, bench
--   bodyweight:     bodyweight, band
-- =============================================================================

INSERT INTO public.exercises (name, muscle_group, equipment, difficulty, instructions, explain_eli5, default_sets, default_reps, default_rest_seconds)
VALUES

-- =============================================================================
-- CHEST (12 exercises)
-- =============================================================================
('Barbell Bench Press', 'chest', ARRAY['barbell', 'bench'], 'intermediate',
 'Lie flat on a bench, grip the bar slightly wider than shoulder-width. Lower the bar to your mid-chest, then press it back up to full arm extension.',
 'You lie on a bench and push a heavy bar up toward the ceiling.',
 4, 8, 120),

('Dumbbell Bench Press', 'chest', ARRAY['dumbbell', 'bench'], 'beginner',
 'Lie on a flat bench holding dumbbells above your chest. Lower them to the sides of your chest, then press them back up.',
 'You lie down and push two weights up like you are opening a big door above you.',
 3, 10, 90),

('Incline Dumbbell Press', 'chest', ARRAY['dumbbell', 'bench'], 'intermediate',
 'Set the bench to a 30-45 degree incline. Press dumbbells from shoulder height to full extension above your upper chest.',
 'You sit on a tilted bench and push weights up toward the ceiling.',
 3, 10, 90),

('Dumbbell Flyes', 'chest', ARRAY['dumbbell', 'bench'], 'intermediate',
 'Lie flat on a bench with dumbbells extended above your chest, palms facing in. Lower the weights in a wide arc until you feel a stretch, then squeeze them back together.',
 'You open your arms wide like a bird and then hug the air.',
 3, 12, 60),

('Push-Up', 'chest', ARRAY['bodyweight'], 'beginner',
 'Start in a plank position with hands slightly wider than shoulders. Lower your chest to the floor, then push back up keeping your body in a straight line.',
 'You push yourself up from the floor like a plank of wood going up and down.',
 3, 15, 60),

('Incline Push-Up', 'chest', ARRAY['bodyweight'], 'beginner',
 'Place your hands on an elevated surface like a bench or step. Perform a push-up keeping your body straight from head to heels.',
 'You do a push-up with your hands on something higher, which makes it easier.',
 3, 12, 60),

('Decline Push-Up', 'chest', ARRAY['bodyweight'], 'intermediate',
 'Place your feet on an elevated surface and your hands on the floor. Perform a push-up, keeping your core tight and body straight.',
 'You do a push-up with your feet up high, which makes it harder.',
 3, 12, 60),

('Cable Chest Fly', 'chest', ARRAY['cable'], 'intermediate',
 'Stand between cable pulleys set at shoulder height. With a slight bend in your elbows, bring your hands together in front of your chest in a hugging motion.',
 'You pull two cables together in front of you like giving a big hug.',
 3, 12, 60),

('Machine Chest Press', 'chest', ARRAY['machine'], 'beginner',
 'Sit in the machine with handles at chest height. Push the handles forward until arms are extended, then slowly return.',
 'You sit in a chair and push handles away from you.',
 3, 10, 90),

('Dumbbell Pullover', 'chest', ARRAY['dumbbell', 'bench'], 'intermediate',
 'Lie across a bench supporting your upper back. Hold one dumbbell overhead with both hands, lower it behind your head in an arc, then pull it back over your chest.',
 'You lie on a bench and swing a weight over your head and back like a rainbow.',
 3, 12, 60),

('Banded Push-Up', 'chest', ARRAY['bodyweight', 'band'], 'intermediate',
 'Loop a resistance band across your back and under your hands. Perform push-ups with the added band resistance throughout the movement.',
 'You do push-ups with a stretchy band on your back to make it harder.',
 3, 10, 60),

('Diamond Push-Up', 'chest', ARRAY['bodyweight'], 'advanced',
 'Place your hands close together under your chest, forming a diamond shape with your thumbs and index fingers. Lower your chest to your hands and press back up.',
 'You do a push-up with your hands making a diamond shape, which is really hard.',
 3, 10, 60),

-- =============================================================================
-- BACK (14 exercises)
-- =============================================================================
('Barbell Bent-Over Row', 'back', ARRAY['barbell'], 'intermediate',
 'Hinge at the hips with a flat back, grip the bar shoulder-width. Pull the bar to your lower chest, squeezing your shoulder blades together, then lower with control.',
 'You bend over and pull a heavy bar up to your tummy.',
 4, 8, 120),

('Dumbbell Row', 'back', ARRAY['dumbbell', 'bench'], 'beginner',
 'Place one knee and hand on a bench for support. Row the dumbbell from a hanging position to your hip, keeping your elbow close to your body.',
 'You lean on a bench and pull a weight up like you are starting a lawnmower.',
 3, 10, 60),

('Pull-Up', 'back', ARRAY['bodyweight'], 'advanced',
 'Hang from a bar with an overhand grip slightly wider than shoulders. Pull yourself up until your chin clears the bar, then lower with control.',
 'You hang from a bar and pull yourself up until your chin goes over it.',
 3, 8, 120),

('Chin-Up', 'back', ARRAY['bodyweight'], 'intermediate',
 'Hang from a bar with an underhand (palms facing you) grip at shoulder width. Pull yourself up until your chin clears the bar.',
 'You hang from a bar with your palms toward you and pull yourself up.',
 3, 8, 120),

('Lat Pulldown', 'back', ARRAY['cable', 'machine'], 'beginner',
 'Sit at a lat pulldown machine with a wide grip on the bar. Pull the bar down to your upper chest while squeezing your shoulder blades, then slowly return.',
 'You sit down and pull a bar from up high down to your chest.',
 3, 10, 90),

('Seated Cable Row', 'back', ARRAY['cable', 'machine'], 'beginner',
 'Sit at the cable row station with feet on the platform. Pull the handle to your lower chest, keeping your back straight, then extend your arms back.',
 'You sit down and pull a handle toward your belly like rowing a boat.',
 3, 10, 90),

('Face Pull', 'back', ARRAY['cable', 'band'], 'beginner',
 'Set a cable or band at face height. Pull toward your face with elbows high, externally rotating your shoulders at the end of the movement.',
 'You pull a rope toward your face and spread your hands apart at the end.',
 3, 15, 60),

('Dumbbell Reverse Fly', 'back', ARRAY['dumbbell'], 'beginner',
 'Bend forward at the hips with a flat back, arms hanging down. Raise the dumbbells out to the sides squeezing your shoulder blades, then lower slowly.',
 'You bend over and lift weights out to the sides like a bird flapping.',
 3, 12, 60),

('Inverted Row', 'back', ARRAY['bodyweight'], 'beginner',
 'Lie under a bar set at waist height. Grab the bar with an overhand grip and pull your chest to the bar, keeping your body straight like a plank.',
 'You hang under a low bar and pull your chest up to it.',
 3, 10, 60),

('T-Bar Row', 'back', ARRAY['barbell'], 'intermediate',
 'Straddle the T-bar or landmine setup, hinge at the hips. Pull the weight to your chest, squeezing your back, then lower under control.',
 'You stand over a bar stuck in the corner and pull the other end up to your chest.',
 4, 8, 120),

('Barbell Deadlift', 'back', ARRAY['barbell'], 'advanced',
 'Stand with feet hip-width, bar over mid-foot. Hinge at the hips and grip the bar, then drive through your feet to stand up fully. Lower by hinging at the hips.',
 'You pick a really heavy bar up off the floor by standing up straight.',
 4, 5, 180),

('Cable Pullover', 'back', ARRAY['cable'], 'intermediate',
 'Face a high cable with a straight bar attachment. With slightly bent arms, pull the bar down in an arc from overhead to your thighs, squeezing your lats.',
 'You pull a cable from up high down to your legs in a big swooping motion.',
 3, 12, 60),

('Banded Pull-Apart', 'back', ARRAY['band'], 'beginner',
 'Hold a resistance band in front of you at shoulder height with straight arms. Pull the band apart by squeezing your shoulder blades together.',
 'You hold a stretchy band and pull it apart in front of you.',
 3, 15, 45),

('Superman Hold', 'back', ARRAY['bodyweight'], 'beginner',
 'Lie face down with arms extended overhead. Simultaneously lift your arms, chest, and legs off the floor. Hold briefly, then lower.',
 'You lie on your tummy and pretend to fly like Superman.',
 3, 10, 45),

-- =============================================================================
-- SHOULDERS (10 exercises)
-- =============================================================================
('Overhead Press', 'shoulders', ARRAY['barbell'], 'intermediate',
 'Stand with feet shoulder-width, bar at collarbone height. Press the bar overhead to full lockout, then lower back to your shoulders.',
 'You push a heavy bar straight up over your head while standing.',
 4, 8, 120),

('Dumbbell Shoulder Press', 'shoulders', ARRAY['dumbbell', 'bench'], 'beginner',
 'Sit or stand holding dumbbells at shoulder height with palms facing forward. Press them overhead until arms are fully extended, then lower back to shoulders.',
 'You push two weights up over your head like you are raising the roof.',
 3, 10, 90),

('Lateral Raise', 'shoulders', ARRAY['dumbbell'], 'beginner',
 'Stand with dumbbells at your sides. Raise your arms out to the sides until they reach shoulder height, keeping a slight bend in your elbows, then lower slowly.',
 'You lift weights out to your sides like you are pretending to be an airplane.',
 3, 15, 60),

('Front Raise', 'shoulders', ARRAY['dumbbell'], 'beginner',
 'Stand holding dumbbells in front of your thighs. Raise one or both arms straight in front of you to shoulder height, then lower with control.',
 'You lift weights in front of you like you are pointing at something far away.',
 3, 12, 60),

('Arnold Press', 'shoulders', ARRAY['dumbbell', 'bench'], 'intermediate',
 'Start with dumbbells at shoulder height, palms facing you. As you press up, rotate your palms to face forward at the top. Reverse the motion on the way down.',
 'You push weights up and twist your hands at the same time, like Arnold Schwarzenegger.',
 3, 10, 90),

('Cable Lateral Raise', 'shoulders', ARRAY['cable'], 'intermediate',
 'Stand beside a low cable pulley, grab the handle with your far hand. Raise your arm out to the side to shoulder height, then lower with control.',
 'You use a cable to lift your arm out to the side like a bird wing.',
 3, 12, 60),

('Pike Push-Up', 'shoulders', ARRAY['bodyweight'], 'intermediate',
 'Start in a downward dog position with hips high and hands shoulder-width apart. Bend your elbows to lower your head toward the floor, then push back up.',
 'You make an upside-down V shape with your body and do push-ups.',
 3, 10, 60),

('Band Pull-Apart Overhead', 'shoulders', ARRAY['band'], 'beginner',
 'Hold a resistance band overhead with straight arms. Pull the band apart by bringing your hands down and out to shoulder height, then return slowly.',
 'You hold a stretchy band over your head and pull it apart.',
 3, 15, 45),

('Machine Shoulder Press', 'shoulders', ARRAY['machine'], 'beginner',
 'Sit in the shoulder press machine, grip the handles at shoulder height. Press upward until arms are extended, then lower with control.',
 'You sit in a machine and push handles up over your head.',
 3, 10, 90),

('Handstand Push-Up (Wall)', 'shoulders', ARRAY['bodyweight'], 'advanced',
 'Kick up into a handstand against a wall. Lower yourself by bending your elbows until your head nearly touches the floor, then press back up.',
 'You go upside down against a wall and do push-ups on your hands.',
 3, 5, 120),

-- =============================================================================
-- BICEPS (8 exercises)
-- =============================================================================
('Barbell Curl', 'biceps', ARRAY['barbell'], 'beginner',
 'Stand holding a barbell with an underhand grip at arm''s length. Curl the bar up to shoulder height by bending your elbows, then lower slowly.',
 'You hold a bar and bend your arms to bring it up to your shoulders.',
 3, 10, 60),

('Dumbbell Curl', 'biceps', ARRAY['dumbbell'], 'beginner',
 'Stand holding dumbbells at your sides with palms facing forward. Curl them up to your shoulders, then lower with control. Alternate arms or do both together.',
 'You bend your arms to lift weights up to your shoulders.',
 3, 10, 60),

('Hammer Curl', 'biceps', ARRAY['dumbbell'], 'beginner',
 'Stand holding dumbbells at your sides with palms facing each other (neutral grip). Curl the weights up without rotating your wrists, then lower slowly.',
 'You curl weights with your palms facing each other, like holding hammers.',
 3, 10, 60),

('Incline Dumbbell Curl', 'biceps', ARRAY['dumbbell', 'bench'], 'intermediate',
 'Sit on an incline bench set to 45 degrees with arms hanging straight down. Curl the dumbbells up to your shoulders, then lower with a full stretch.',
 'You sit on a tilted bench and curl weights up, which gives a bigger stretch.',
 3, 10, 60),

('Cable Curl', 'biceps', ARRAY['cable'], 'beginner',
 'Stand facing a low cable pulley with a straight or EZ bar attachment. Curl the handle up to shoulder height, keeping your elbows at your sides.',
 'You curl a cable handle up to your shoulders.',
 3, 12, 60),

('Concentration Curl', 'biceps', ARRAY['dumbbell'], 'intermediate',
 'Sit on a bench with your elbow braced against your inner thigh. Curl the dumbbell up to your shoulder, squeezing at the top, then lower slowly.',
 'You sit down and curl a weight with one arm resting on your leg.',
 3, 12, 45),

('Band Bicep Curl', 'biceps', ARRAY['band'], 'beginner',
 'Stand on a resistance band and hold the ends with an underhand grip. Curl your hands toward your shoulders, keeping your elbows at your sides.',
 'You stand on a stretchy band and pull the ends up to your shoulders.',
 3, 12, 45),

('Chin-Up (Bicep Focus)', 'biceps', ARRAY['bodyweight'], 'advanced',
 'Hang from a bar with a close underhand grip. Pull yourself up focusing on squeezing your biceps, until your chin clears the bar.',
 'You pull yourself up on a bar using mostly your arm muscles.',
 3, 6, 120),

-- =============================================================================
-- TRICEPS (8 exercises)
-- =============================================================================
('Tricep Pushdown', 'triceps', ARRAY['cable'], 'beginner',
 'Stand at a cable machine with a rope or bar attachment set high. Push the handle down by extending your elbows, keeping your upper arms at your sides.',
 'You push a cable handle down by straightening your arms.',
 3, 12, 60),

('Overhead Tricep Extension', 'triceps', ARRAY['dumbbell'], 'beginner',
 'Hold one dumbbell overhead with both hands. Lower it behind your head by bending your elbows, then extend your arms to press it back up.',
 'You hold a weight over your head and bend your arms back and forth behind you.',
 3, 10, 60),

('Skull Crusher', 'triceps', ARRAY['barbell', 'bench'], 'intermediate',
 'Lie on a bench holding a barbell or EZ bar with arms extended above your chest. Lower the bar toward your forehead by bending your elbows, then press back up.',
 'You lie down and bend your arms to lower a bar toward your head, then push it back up.',
 3, 10, 90),

('Diamond Push-Up (Triceps)', 'triceps', ARRAY['bodyweight'], 'intermediate',
 'Get in push-up position with hands close together forming a diamond. Lower your chest to your hands focusing on the tricep squeeze, then push back up.',
 'You do push-ups with your hands together to work the back of your arms.',
 3, 10, 60),

('Tricep Dip', 'triceps', ARRAY['bodyweight'], 'intermediate',
 'Support yourself on parallel bars or a bench with arms straight. Lower your body by bending your elbows to 90 degrees, then push back up.',
 'You hold yourself up on bars and dip your body down, then push back up.',
 3, 10, 90),

('Cable Overhead Extension', 'triceps', ARRAY['cable'], 'intermediate',
 'Face away from a high cable, grip the rope behind your head. Extend your arms overhead by straightening your elbows, then return to the stretch position.',
 'You face away from a cable and push the rope forward over your head.',
 3, 12, 60),

('Tricep Kickback', 'triceps', ARRAY['dumbbell'], 'beginner',
 'Hinge forward at the hips, hold a dumbbell with your upper arm parallel to your body. Extend your forearm straight back, then bend your elbow to return.',
 'You bend over and push a weight straight back behind you.',
 3, 12, 45),

('Band Tricep Pushdown', 'triceps', ARRAY['band'], 'beginner',
 'Anchor a resistance band above you. Grip the band and push down by extending your elbows, keeping your upper arms still.',
 'You push a stretchy band down by straightening your arms.',
 3, 15, 45),

-- =============================================================================
-- QUADS (12 exercises)
-- =============================================================================
('Barbell Back Squat', 'quads', ARRAY['barbell'], 'intermediate',
 'Place the bar across your upper back, feet shoulder-width apart. Squat down until your thighs are parallel to the floor, then drive back up through your heels.',
 'You put a bar on your back and sit down, then stand back up.',
 4, 8, 120),

('Goblet Squat', 'quads', ARRAY['dumbbell'], 'beginner',
 'Hold a dumbbell vertically at your chest with both hands. Squat down keeping your chest up and elbows inside your knees, then stand back up.',
 'You hold a weight at your chest like a goblet and sit down and stand up.',
 3, 12, 60),

('Bodyweight Squat', 'quads', ARRAY['bodyweight'], 'beginner',
 'Stand with feet shoulder-width apart, arms in front for balance. Lower your hips back and down until thighs are parallel, then stand back up.',
 'You sit down in the air without a chair and stand back up.',
 3, 15, 45),

('Front Squat', 'quads', ARRAY['barbell'], 'advanced',
 'Hold the barbell across the front of your shoulders in a clean grip. Squat down keeping your elbows high and torso upright, then drive up.',
 'You hold a heavy bar in front of your neck and squat down and up.',
 4, 6, 150),

('Leg Press', 'quads', ARRAY['machine'], 'beginner',
 'Sit in the leg press with feet shoulder-width apart on the platform. Lower the weight by bending your knees to 90 degrees, then press back up.',
 'You sit in a machine and push a heavy platform away with your legs.',
 3, 10, 90),

('Walking Lunge', 'quads', ARRAY['bodyweight'], 'beginner',
 'Step forward into a lunge, lowering your back knee toward the floor. Push off your front foot and step forward into the next lunge.',
 'You take big steps forward while bending your knees each time.',
 3, 12, 60),

('Dumbbell Lunge', 'quads', ARRAY['dumbbell'], 'intermediate',
 'Hold dumbbells at your sides and step forward into a lunge. Lower your back knee toward the floor, then push back to standing. Alternate legs.',
 'You hold weights and take a big step, bending both knees, then come back.',
 3, 10, 60),

('Bulgarian Split Squat', 'quads', ARRAY['dumbbell', 'bench'], 'intermediate',
 'Stand in front of a bench with one foot resting on it behind you. Lower your body by bending your front knee, then press back up through your front heel.',
 'You put one foot on a bench behind you and do a one-leg squat.',
 3, 10, 90),

('Leg Extension', 'quads', ARRAY['machine'], 'beginner',
 'Sit in the leg extension machine with the pad on your shins. Extend your legs to straighten them, squeeze at the top, then lower slowly.',
 'You sit in a machine and kick your legs straight out in front of you.',
 3, 12, 60),

('Step-Up', 'quads', ARRAY['bodyweight', 'bench'], 'beginner',
 'Stand in front of a bench or step. Step up with one foot, drive through your heel to stand on top, then step back down. Alternate or do all reps on one side.',
 'You step up onto a high step like climbing a big stair.',
 3, 10, 60),

('Kettlebell Squat', 'quads', ARRAY['kettlebell'], 'beginner',
 'Hold a kettlebell at your chest with both hands. Squat down keeping your chest up, then drive through your heels to stand back up.',
 'You hold a round weight at your chest and sit down and stand up.',
 3, 12, 60),

('Wall Sit', 'quads', ARRAY['bodyweight'], 'beginner',
 'Lean your back against a wall and slide down until your thighs are parallel to the floor. Hold this seated position for time.',
 'You pretend to sit in an invisible chair against the wall and hold still.',
 3, 30, 60),

-- =============================================================================
-- HAMSTRINGS (8 exercises)
-- =============================================================================
('Romanian Deadlift', 'hamstrings', ARRAY['barbell'], 'intermediate',
 'Stand holding a barbell at hip height. Hinge at the hips, pushing them back as you lower the bar along your legs. Return by driving your hips forward.',
 'You hold a bar and bend forward at the hips like bowing, then stand back up.',
 3, 10, 90),

('Dumbbell Romanian Deadlift', 'hamstrings', ARRAY['dumbbell'], 'beginner',
 'Hold dumbbells in front of your thighs. Hinge forward at the hips, lowering the weights along your legs until you feel a stretch, then stand back up.',
 'You hold weights and bend forward until you feel a stretch in the back of your legs.',
 3, 10, 90),

('Lying Leg Curl', 'hamstrings', ARRAY['machine'], 'beginner',
 'Lie face down on the leg curl machine with the pad behind your ankles. Curl your heels toward your glutes, then lower slowly.',
 'You lie on your tummy and bend your legs to bring your feet toward your bottom.',
 3, 12, 60),

('Nordic Hamstring Curl', 'hamstrings', ARRAY['bodyweight'], 'advanced',
 'Kneel on the floor with your ankles anchored. Slowly lower your body forward, resisting with your hamstrings. Push off the floor to help return to upright.',
 'You kneel down and fall forward slowly, catching yourself with your hands.',
 3, 6, 90),

('Good Morning', 'hamstrings', ARRAY['barbell'], 'intermediate',
 'Place a barbell across your upper back. With a slight knee bend, hinge at the hips lowering your torso toward parallel, then return to standing.',
 'You put a bar on your back and bow forward like saying good morning.',
 3, 10, 90),

('Kettlebell Swing', 'hamstrings', ARRAY['kettlebell'], 'intermediate',
 'Stand with feet wider than shoulder-width, kettlebell on the floor in front of you. Hike it back between your legs, then snap your hips forward to swing it to chest height.',
 'You swing a heavy ball between your legs and up to your chest by popping your hips.',
 3, 15, 60),

('Single-Leg Deadlift', 'hamstrings', ARRAY['dumbbell'], 'intermediate',
 'Stand on one leg holding a dumbbell. Hinge forward at the hip, extending your free leg behind you for balance. Return to standing by squeezing your hamstring and glute.',
 'You stand on one leg and bend forward like a seesaw.',
 3, 10, 60),

('Band Leg Curl', 'hamstrings', ARRAY['band'], 'beginner',
 'Lie face down with a resistance band anchored low and looped around one ankle. Curl your heel toward your glute against the band tension, then lower slowly.',
 'You lie on your tummy and bend your leg against a stretchy band.',
 3, 12, 45),

-- =============================================================================
-- GLUTES (8 exercises)
-- =============================================================================
('Barbell Hip Thrust', 'glutes', ARRAY['barbell', 'bench'], 'intermediate',
 'Sit on the floor with your upper back against a bench, barbell across your hips. Drive through your heels to lift your hips until your body forms a straight line from shoulders to knees.',
 'You lean on a bench and push your hips up with a heavy bar on your lap.',
 4, 10, 90),

('Glute Bridge', 'glutes', ARRAY['bodyweight'], 'beginner',
 'Lie on your back with knees bent and feet flat on the floor. Push through your heels to lift your hips toward the ceiling, squeeze your glutes, then lower.',
 'You lie on your back and push your hips up toward the ceiling.',
 3, 15, 45),

('Dumbbell Hip Thrust', 'glutes', ARRAY['dumbbell', 'bench'], 'beginner',
 'Sit with your upper back against a bench, a dumbbell resting on your hips. Drive through your heels to raise your hips until your torso is parallel to the floor.',
 'You lean on a bench and push your hips up with a weight on your lap.',
 3, 12, 60),

('Cable Pull-Through', 'glutes', ARRAY['cable'], 'intermediate',
 'Face away from a low cable, straddle the rope attachment. Hinge at the hips, letting the cable pull your hands between your legs, then drive your hips forward to stand.',
 'You face away from a cable and push your hips forward to pull the rope through your legs.',
 3, 12, 60),

('Sumo Squat', 'glutes', ARRAY['dumbbell'], 'beginner',
 'Stand with a wide stance and toes pointed out, holding a dumbbell with both hands between your legs. Squat down and up, keeping your chest tall.',
 'You stand with your feet really wide apart and squat down holding a weight.',
 3, 12, 60),

('Donkey Kick', 'glutes', ARRAY['bodyweight'], 'beginner',
 'Get on all fours. Keeping your knee bent at 90 degrees, drive one foot toward the ceiling by squeezing your glute. Lower and repeat.',
 'You get on your hands and knees and kick one foot up toward the sky.',
 3, 15, 45),

('Banded Clamshell', 'glutes', ARRAY['band'], 'beginner',
 'Lie on your side with a band around your knees, knees bent at 45 degrees. Open your top knee against the band while keeping your feet together, then close slowly.',
 'You lie on your side and open and close your knees like a clam.',
 3, 15, 45),

('Single-Leg Glute Bridge', 'glutes', ARRAY['bodyweight'], 'intermediate',
 'Lie on your back with one knee bent and the other leg extended. Drive through the planted foot to lift your hips, squeezing your glute at the top.',
 'You push your hips up while balancing on just one foot.',
 3, 12, 45),

-- =============================================================================
-- CALVES (6 exercises)
-- =============================================================================
('Standing Calf Raise', 'calves', ARRAY['bodyweight'], 'beginner',
 'Stand on the edge of a step with your heels hanging off. Rise up on your toes as high as possible, then lower your heels below the step for a full stretch.',
 'You stand on your tippy toes and go up and down.',
 3, 15, 45),

('Seated Calf Raise', 'calves', ARRAY['machine'], 'beginner',
 'Sit in the calf raise machine with the pad on your lower thighs. Push up onto your toes, pause at the top, then lower your heels for a deep stretch.',
 'You sit in a machine and push up on your toes.',
 3, 15, 45),

('Dumbbell Calf Raise', 'calves', ARRAY['dumbbell'], 'beginner',
 'Stand holding dumbbells at your sides on a flat surface or step edge. Rise up on your toes, squeeze at the top, then lower slowly.',
 'You hold weights and go up on your tippy toes.',
 3, 15, 45),

('Single-Leg Calf Raise', 'calves', ARRAY['bodyweight'], 'intermediate',
 'Stand on one foot on the edge of a step. Rise up on your toes as high as possible, then lower your heel below the step. Use a wall for balance.',
 'You go up on your tippy toes on just one foot.',
 3, 12, 45),

('Barbell Calf Raise', 'calves', ARRAY['barbell'], 'intermediate',
 'Stand with a barbell across your upper back, balls of your feet on a raised surface. Rise up on your toes, squeeze at the top, then lower with control.',
 'You put a bar on your back and go up and down on your toes.',
 4, 12, 60),

('Band Calf Raise', 'calves', ARRAY['band'], 'beginner',
 'Sit on the floor with legs extended, loop a band around the ball of one foot. Push your toes away from you against the band resistance, then slowly return.',
 'You push your foot against a stretchy band like pressing a gas pedal.',
 3, 15, 45),

-- =============================================================================
-- CORE (12 exercises)
-- =============================================================================
('Plank', 'core', ARRAY['bodyweight'], 'beginner',
 'Support your body on your forearms and toes, keeping a straight line from head to heels. Brace your core and hold this position for time.',
 'You hold yourself stiff as a board on your arms and toes.',
 3, 30, 45),

('Dead Bug', 'core', ARRAY['bodyweight'], 'beginner',
 'Lie on your back with arms extended to the ceiling and knees at 90 degrees. Slowly lower one arm and the opposite leg toward the floor, then return and alternate.',
 'You lie on your back and move your arms and legs like an upside-down bug.',
 3, 10, 45),

('Bicycle Crunch', 'core', ARRAY['bodyweight'], 'beginner',
 'Lie on your back with hands behind your head, legs raised. Rotate your torso to bring one elbow to the opposite knee while extending the other leg. Alternate sides.',
 'You lie down and pedal your legs in the air while twisting your body.',
 3, 15, 45),

('Mountain Climber', 'core', ARRAY['bodyweight'], 'beginner',
 'Start in a push-up position. Drive one knee toward your chest, then quickly switch legs in a running motion while keeping your hips low.',
 'You get in push-up position and run your knees up to your chest.',
 3, 20, 45),

('Ab Rollout', 'core', ARRAY['barbell'], 'advanced',
 'Kneel with a barbell or ab wheel in front of you. Roll forward extending your body as far as you can while keeping your core tight, then roll back to the start.',
 'You roll a wheel away from you on the floor and pull it back with your tummy muscles.',
 3, 8, 60),

('Hanging Leg Raise', 'core', ARRAY['bodyweight'], 'advanced',
 'Hang from a pull-up bar with straight arms. Raise your legs in front of you until they are parallel to the floor or higher, then lower with control.',
 'You hang from a bar and lift your legs up in front of you.',
 3, 10, 60),

('Cable Woodchop', 'core', ARRAY['cable'], 'intermediate',
 'Stand sideways to a cable set high. Pull the handle diagonally across your body from high to low in a chopping motion, rotating your torso. Control the return.',
 'You pull a cable across your body like chopping a tree.',
 3, 12, 60),

('Russian Twist', 'core', ARRAY['bodyweight'], 'intermediate',
 'Sit with knees bent and feet slightly off the floor, leaning back at 45 degrees. Rotate your torso to touch the floor on each side of your hips.',
 'You sit and twist side to side like you are looking behind you both ways.',
 3, 20, 45),

('Pallof Press', 'core', ARRAY['cable', 'band'], 'intermediate',
 'Stand perpendicular to a cable or band anchor at chest height. Hold the handle at your chest, then press it straight out, resisting the rotation. Return to chest.',
 'You push a cable away from your chest while trying not to twist.',
 3, 10, 45),

('Bird Dog', 'core', ARRAY['bodyweight'], 'beginner',
 'Start on all fours. Simultaneously extend one arm forward and the opposite leg back, keeping your hips level. Hold briefly, return, and alternate sides.',
 'You get on your hands and knees and reach one arm and the opposite leg out.',
 3, 10, 45),

('Side Plank', 'core', ARRAY['bodyweight'], 'intermediate',
 'Lie on your side, prop yourself up on your forearm with feet stacked. Lift your hips to create a straight line from head to feet and hold.',
 'You balance on your side on one arm and hold yourself up like a stiff board.',
 3, 30, 45),

('Band Anti-Rotation Hold', 'core', ARRAY['band'], 'beginner',
 'Anchor a band at chest height and hold it with both hands at your chest. Press your arms out straight and hold, resisting the pull of the band.',
 'You hold a stretchy band with straight arms and try not to let it pull you sideways.',
 3, 20, 45),

-- =============================================================================
-- FULL BODY (10 exercises)
-- =============================================================================
('Burpee', 'full_body', ARRAY['bodyweight'], 'intermediate',
 'From standing, squat down and place your hands on the floor. Jump your feet back to a push-up position, do a push-up, jump your feet forward, and leap up.',
 'You drop to the floor, do a push-up, jump up, and repeat.',
 3, 10, 60),

('Kettlebell Clean and Press', 'full_body', ARRAY['kettlebell'], 'advanced',
 'Start with a kettlebell between your feet. Hike it back, clean it to your shoulder in one motion, then press it overhead. Reverse back to the start.',
 'You swing a heavy bell up to your shoulder and then push it over your head.',
 3, 8, 90),

('Dumbbell Thruster', 'full_body', ARRAY['dumbbell'], 'intermediate',
 'Hold dumbbells at shoulder height, squat down until thighs are parallel. Drive up explosively and use the momentum to press the weights overhead.',
 'You squat down holding weights and then stand up fast pushing them over your head.',
 3, 10, 90),

('Man Maker', 'full_body', ARRAY['dumbbell'], 'advanced',
 'Start in push-up position on dumbbells. Do a push-up, row each dumbbell, jump your feet to your hands, clean the weights to your shoulders, and press overhead.',
 'You do a push-up, pull the weights up, stand up, and push them over your head all in a row.',
 3, 6, 120),

('Turkish Get-Up', 'full_body', ARRAY['kettlebell'], 'advanced',
 'Lie on your back holding a kettlebell above you with one arm. Stand up through a series of controlled movements while keeping the weight overhead, then reverse back down.',
 'You lie down holding a weight up and slowly stand all the way up without dropping it.',
 3, 5, 90),

('Bear Crawl', 'full_body', ARRAY['bodyweight'], 'beginner',
 'Get on all fours with knees hovering just above the ground. Move forward by stepping opposite hand and foot together, keeping your back flat and hips low.',
 'You crawl on your hands and feet like a bear.',
 3, 20, 60),

('Squat to Press', 'full_body', ARRAY['dumbbell'], 'beginner',
 'Hold dumbbells at shoulder height. Squat down, then as you stand up, press the weights overhead in one smooth motion.',
 'You sit down and stand up while pushing weights over your head.',
 3, 10, 60),

('Barbell Clean', 'full_body', ARRAY['barbell'], 'advanced',
 'Stand over the bar with feet hip-width. Pull the bar off the floor by extending your hips explosively, catch it at your shoulders in a front squat position, then stand.',
 'You pull a heavy bar from the floor and catch it on your shoulders really fast.',
 4, 5, 150),

('Inchworm', 'full_body', ARRAY['bodyweight'], 'beginner',
 'From standing, bend over and walk your hands out to a plank position. Do a push-up (optional), then walk your hands back to your feet and stand up.',
 'You bend over and walk your hands out like a caterpillar, then walk them back.',
 3, 8, 45),

('Jump Squat', 'full_body', ARRAY['bodyweight'], 'intermediate',
 'Stand with feet shoulder-width apart. Squat down, then explode up jumping as high as you can. Land softly with bent knees and immediately go into the next rep.',
 'You squat down and jump as high as you can, over and over.',
 3, 12, 60);
