// Interactive body map for the Exercises tab.
// Offline SVG silhouettes with:
//  - Separate MALE and FEMALE figures (defaults to the profile sex, switchable)
//  - Front and back views with their own muscle contours
//  - Fine muscle zones (quads / glutes / hams / calves / lats / …)
//  - Recently-trained heat overlay from logged sets
//  - Category + muscle-tag filtering
//
// Figures redrawn July 2026. Male: 126px shoulder span over a 56px waist, wide
// pec shelf, fanning lats, heavier limbs. Female: 84px shoulders, waist 40px set
// 11px higher, wider iliac flare, bust contour, fuller glutes/hams, slimmer
// limbs. Both keep the 0 0 220 480 viewBox, zone ids and CSS classes, so
// css/styles.css needs no changes.
window.BodyMap = (function () {
  /**
   * Zone definitions.
   * - category: parent library category (for chip sync)
   * - muscleMatch: regex against exercise.muscles + name (fine filter)
   * - coarse: if true, filter by category only (whole group)
   * - views: which silhouettes show this zone
   * Badge positions live per sex + view in GEOMETRY[sex][view].badges, since the
   * two figures put the same muscle in slightly different places.
   */
  const ZONES = {
    // —— Upper body ——
    shoulders: { label: "Shoulders", category: "shoulders", coarse: true, muscleMatch: /deltoid|shoulder/i, views: ["front", "back"] },
    chest: { label: "Chest", category: "chest", coarse: true, muscleMatch: /pector|chest/i, views: ["front"] },
    arms: { label: "Arms", category: "arms", coarse: true, muscleMatch: /bicep|tricep|forearm|brachial/i, views: ["front", "back"] },
    // —— Back splits ——
    upper_back: { label: "Upper back", category: "back", muscleMatch: /trap|rhomboid|upper back|rear deltoid|external rotator/i, views: ["back"] },
    lats: { label: "Lats", category: "back", muscleMatch: /\blats?\b|latissimus/i, views: ["back"] },
    lower_back: { label: "Lower back", category: "back", muscleMatch: /erector|lower back|quadratus/i, views: ["back"] },
    // Whole-back zone for the coarse "Back" chip (not drawn as its own shape)
    back: { label: "Back", category: "back", coarse: true, muscleMatch: /lat|rhomboid|traps?|erector|back/i, views: [] },
    // —— Core ——
    core: { label: "Core", category: "core", coarse: true, muscleMatch: /abdominal|oblique|core|hip flexor|quadratus/i, views: ["front"] },
    // —— Legs splits ——
    quads: { label: "Quads", category: "legs", muscleMatch: /quad/i, views: ["front"] },
    // Hip flexors / adductors — the two most-stretched areas, which strength
    // training rarely targets directly but mobility work does.
    hip_flexors: { label: "Hip flexors", category: "mobility", muscleMatch: /hip flexor|psoas|iliopsoas/i, views: ["front"] },
    adductors: { label: "Adductors", category: "mobility", muscleMatch: /adductor|groin|inner thigh/i, views: ["front"] },
    glutes: { label: "Glutes", category: "legs", muscleMatch: /glute/i, views: ["back"] },
    hams: { label: "Hamstrings", category: "legs", muscleMatch: /hamstring/i, views: ["back"] },
    calves: { label: "Calves", category: "legs", muscleMatch: /calf|calves|gastroc|soleus/i, views: ["front", "back"] },
    // Coarse legs (chip only)
    legs: { label: "Legs", category: "legs", coarse: true, muscleMatch: /quad|hamstring|glute|calf|calves|adductor|abductor|hip/i, views: [] }
  };

  const GEOMETRY = {
    male: {
      front: {
        silhouette: [
          "M110 10 C121 10 130 21 130 35 C130 49 121 61 110 61 C99 61 90 49 90 35 C90 21 99 10 110 10 Z",
          "M110 54 C117 54 122 60 123 71 C139 74 156 79 165 86 C172 93 174 103 172 113 C170 121 163 126 153 128 C148 143 143 162 138 180 C141 194 143 205 143 217 C143 230 140 242 136 252 C128 258 119 260 110 260 C101 260 92 258 84 252 C80 242 77 230 77 217 C77 205 79 194 82 180 C77 162 72 143 67 128 C57 126 50 121 48 113 C46 103 48 93 55 86 C64 79 81 74 97 71 C98 60 103 54 110 54 Z",
          "M153 106 C164 106 172 113 173 124 C176 144 178 164 179 186 C183 212 184 237 183 260 C183 278 180 290 175 296 C169 301 162 298 161 290 C160 276 161 267 162 257 C163 237 162 212 160 188 C157 166 153 144 151 126 C150 116 151 107 153 106 Z",
          "M67 106 C56 106 48 113 47 124 C44 144 42 164 41 186 C37 212 36 237 37 260 C37 278 40 290 45 296 C51 301 58 298 59 290 C60 276 59 267 58 257 C57 237 58 212 60 188 C63 166 67 144 69 126 C70 116 69 107 67 106 Z",
          "M110 244 C122 242 134 246 139 256 C143 276 143 302 140 326 C139 336 137 342 136 348 C140 366 141 384 138 402 C136 420 133 432 131 442 C133 452 139 459 146 463 C148 467 145 469 139 469 L117 469 C112 469 110 465 111 459 C113 445 114 432 113 420 C111 404 110 388 111 372 C112 356 113 350 112 342 C110 326 108 302 108 278 C108 264 109 252 110 244 Z",
          "M110 244 C98 242 86 246 81 256 C77 276 77 302 80 326 C81 336 83 342 84 348 C80 366 79 384 82 402 C84 420 87 432 89 442 C87 452 81 459 74 463 C72 467 75 469 81 469 L103 469 C108 469 110 465 109 459 C107 445 106 432 107 420 C109 404 110 388 109 372 C108 356 107 350 108 342 C110 326 112 302 112 278 C112 264 111 252 110 244 Z"
        ],
        detail: [
          "M93 78 Q104 86 110 83",
          "M127 78 Q116 86 110 83",
          "M105 62 L106 72",
          "M115 62 L114 72",
          "M110 102 L110 148",
          "M110 152 L110 240",
          "M96 168 Q103 164 109 165",
          "M124 168 Q117 164 111 165",
          "M95 186 Q103 182 109 183",
          "M125 186 Q117 182 111 183",
          "M96 204 Q103 200 109 201",
          "M124 204 Q117 200 111 201",
          "M92 162 Q88 182 94 202",
          "M128 162 Q132 182 126 202",
          "M94 226 Q102 238 109 240",
          "M126 226 Q118 238 111 240",
          "M160 98 Q166 110 165 124",
          "M60 98 Q54 110 55 124",
          "M170 146 Q174 162 174 178",
          "M50 146 Q46 162 46 178",
          "M178 206 Q182 224 180 242",
          "M42 206 Q38 224 40 242",
          "M128 266 Q133 300 129 336",
          "M92 266 Q87 300 91 336",
          "M121 272 Q123 304 120 332",
          "M99 272 Q97 304 100 332",
          "M124 348 Q129 354 125 360",
          "M96 348 Q91 354 95 360",
          "M123 368 Q126 400 121 430",
          "M97 368 Q94 400 99 430"
        ],
        regions: {
          shoulders: [
            "M148 84 C159 86 169 92 172 104 C174 115 172 125 166 131 C158 133 151 130 148 123 C145 113 145 94 148 84 Z",
            "M72 84 C61 86 51 92 48 104 C46 115 48 125 54 131 C62 133 69 130 72 123 C75 113 75 94 72 84 Z"
          ],
          chest: [
            "M111 100 C124 98 137 102 144 110 C148 117 147 129 143 137 C139 144 129 148 118 148 C112 148 111 144 110 137 L110 102 Z",
            "M109 100 C96 98 83 102 76 110 C72 117 73 129 77 137 C81 144 91 148 102 148 C108 148 109 144 110 137 L110 102 Z"
          ],
          arms: [
            "M170 134 C174 154 176 172 177 188 C181 214 182 238 181 260 C176 262 171 260 167 256 C166 236 164 214 162 192 C160 174 157 154 154 136 C159 138 165 137 170 134 Z",
            "M50 134 C46 154 44 172 43 188 C39 214 38 238 39 260 C44 262 49 260 53 256 C54 236 56 214 58 192 C60 174 63 154 66 136 C61 138 55 137 50 134 Z"
          ],
          core: [
            "M110 151 C118 151 128 153 134 159 C138 169 138 183 136 197 C134 213 129 229 122 239 C118 244 112 245 110 245 C108 245 102 244 98 239 C91 229 86 213 84 197 C82 183 82 169 86 159 C92 153 102 151 110 151 Z"
          ],
          quads: [
            "M116 254 C126 250 137 254 142 263 C146 278 145 298 142 314 C140 328 138 336 136 344 C129 349 120 348 116 342 C114 324 115 304 116 286 C117 270 116 262 116 254 Z",
            "M104 254 C94 250 83 254 78 263 C74 278 75 298 78 314 C80 328 82 336 84 344 C91 349 100 348 104 342 C106 324 105 304 104 286 C103 270 104 262 104 254 Z"
          ],
          // Front-of-hip crease, tucked between the core and the upper quad.
          hip_flexors: [
            "M114 240 C123 238 131 244 134 254 C135 262 133 269 129 274 C123 274 117 270 115 264 C114 256 114 248 114 240 Z",
            "M106 240 C97 238 89 244 86 254 C85 262 87 269 91 274 C97 274 103 270 105 264 C106 256 106 248 106 240 Z"
          ],
          // Inner-thigh strip, drawn inside the quads so both stay tappable.
          adductors: [
            "M112 258 C118 261 121 271 121 285 C121 300 119 314 117 324 C114 322 112 316 112 308 C112 292 112 274 112 258 Z",
            "M108 258 C102 261 99 271 99 285 C99 300 101 314 103 324 C106 322 108 316 108 308 C108 292 108 274 108 258 Z"
          ],
          calves: [
            "M117 358 C123 350 132 350 138 358 C142 370 141 388 138 402 C136 413 134 423 133 432 C128 436 121 436 117 431 C115 421 114 411 115 402 C117 388 118 372 117 358 Z",
            "M103 358 C97 350 88 350 82 358 C78 370 79 388 82 402 C84 413 86 423 87 432 C92 436 99 436 103 431 C105 421 106 411 105 402 C103 388 102 372 103 358 Z"
          ]
        },
        badges: {
          shoulders: { x: 162, y: 105 },
          chest: { x: 126, y: 120 },
          arms: { x: 48, y: 204 },
          core: { x: 110, y: 196 },
          hip_flexors: { x: 128, y: 248 },
          adductors: { x: 110, y: 272 },
          quads: { x: 126, y: 300 },
          calves: { x: 126, y: 394 }
        }
      },
      back: {
        silhouette: [
          "M110 10 C121 10 130 21 130 35 C130 49 121 61 110 61 C99 61 90 49 90 35 C90 21 99 10 110 10 Z",
          "M110 54 C117 54 122 60 123 71 C139 74 156 79 165 86 C172 93 174 103 172 113 C170 121 163 126 153 128 C148 143 143 162 138 180 C141 194 143 205 143 217 C143 230 140 242 136 252 C128 258 119 260 110 260 C101 260 92 258 84 252 C80 242 77 230 77 217 C77 205 79 194 82 180 C77 162 72 143 67 128 C57 126 50 121 48 113 C46 103 48 93 55 86 C64 79 81 74 97 71 C98 60 103 54 110 54 Z",
          "M153 106 C164 106 172 113 173 124 C176 144 178 164 179 186 C183 212 184 237 183 260 C183 278 180 290 175 296 C169 301 162 298 161 290 C160 276 161 267 162 257 C163 237 162 212 160 188 C157 166 153 144 151 126 C150 116 151 107 153 106 Z",
          "M67 106 C56 106 48 113 47 124 C44 144 42 164 41 186 C37 212 36 237 37 260 C37 278 40 290 45 296 C51 301 58 298 59 290 C60 276 59 267 58 257 C57 237 58 212 60 188 C63 166 67 144 69 126 C70 116 69 107 67 106 Z",
          "M110 244 C122 242 134 246 139 256 C143 276 143 302 140 326 C139 336 137 342 136 348 C140 366 141 384 138 402 C136 420 133 432 131 442 C133 452 139 459 146 463 C148 467 145 469 139 469 L117 469 C112 469 110 465 111 459 C113 445 114 432 113 420 C111 404 110 388 111 372 C112 356 113 350 112 342 C110 326 108 302 108 278 C108 264 109 252 110 244 Z",
          "M110 244 C98 242 86 246 81 256 C77 276 77 302 80 326 C81 336 83 342 84 348 C80 366 79 384 82 402 C84 420 87 432 89 442 C87 452 81 459 74 463 C72 467 75 469 81 469 L103 469 C108 469 110 465 109 459 C107 445 106 432 107 420 C109 404 110 388 109 372 C108 356 107 350 108 342 C110 326 112 302 112 278 C112 264 111 252 110 244 Z"
        ],
        detail: [
          "M110 74 L110 190",
          "M110 84 L122 100",
          "M110 84 L98 100",
          "M98 108 Q92 118 96 128",
          "M122 108 Q128 118 124 128",
          "M126 140 Q122 162 117 178",
          "M94 140 Q98 162 103 178",
          "M104 196 L104 238",
          "M116 196 L116 238",
          "M160 98 Q166 110 165 124",
          "M60 98 Q54 110 55 124",
          "M170 146 Q174 162 174 178",
          "M50 146 Q46 162 46 178",
          "M178 206 Q182 224 180 242",
          "M42 206 Q38 224 40 242",
          "M88 280 Q98 288 108 284",
          "M132 280 Q122 288 112 284",
          "M126 308 Q128 334 126 362",
          "M94 308 Q92 334 94 362",
          "M117 372 Q124 377 131 371",
          "M103 372 Q96 377 89 371",
          "M124 386 Q127 406 124 424",
          "M96 386 Q93 406 96 424"
        ],
        regions: {
          shoulders: [
            "M148 84 C159 86 169 92 172 104 C174 115 172 125 166 131 C158 133 151 130 148 123 C145 113 145 94 148 84 Z",
            "M72 84 C61 86 51 92 48 104 C46 115 48 125 54 131 C62 133 69 130 72 123 C75 113 75 94 72 84 Z"
          ],
          upper_back: [
            "M110 74 C115 74 120 77 124 81 C135 85 146 91 151 100 C154 107 153 116 149 122 C139 129 129 133 118 135 C113 136 111 131 110 124 C109 131 107 136 102 135 C91 133 81 129 71 122 C67 116 66 107 69 100 C74 91 85 85 96 81 C100 77 105 74 110 74 Z"
          ],
          lats: [
            "M110 136 C121 134 132 130 141 125 C145 134 146 147 143 160 C140 174 134 185 126 192 C121 197 112 196 110 189 C108 196 99 197 94 192 C86 185 80 174 77 160 C74 147 75 134 79 125 C88 130 99 134 110 136 Z"
          ],
          lower_back: [
            "M110 192 C116 192 121 196 123 202 C125 214 124 226 121 235 C118 242 113 244 110 244 C107 244 102 242 99 235 C96 226 95 214 97 202 C99 196 104 192 110 192 Z"
          ],
          arms: [
            "M170 134 C174 154 176 172 177 188 C181 214 182 238 181 260 C176 262 171 260 167 256 C166 236 164 214 162 192 C160 174 157 154 154 136 C159 138 165 137 170 134 Z",
            "M50 134 C46 154 44 172 43 188 C39 214 38 238 39 260 C44 262 49 260 53 256 C54 236 56 214 58 192 C60 174 63 154 66 136 C61 138 55 137 50 134 Z"
          ],
          glutes: [
            "M110 246 C121 242 133 244 140 253 C144 264 143 279 137 289 C131 297 121 299 113 293 C111 291 110 288 110 285 C110 288 109 291 107 293 C99 299 89 297 83 289 C77 279 76 264 80 253 C87 244 99 242 110 246 Z"
          ],
          hams: [
            "M117 300 C125 296 135 298 141 305 C144 317 143 333 140 347 C138 358 135 366 132 370 C126 374 119 373 116 368 C115 352 115 334 116 320 C116 312 117 305 117 300 Z",
            "M103 300 C95 296 85 298 79 305 C76 317 77 333 80 347 C82 358 85 366 88 370 C94 374 101 373 104 368 C105 352 105 334 104 320 C104 312 103 305 103 300 Z"
          ],
          calves: [
            "M117 358 C123 350 132 350 138 358 C142 370 141 388 138 402 C136 413 134 423 133 432 C128 436 121 436 117 431 C115 421 114 411 115 402 C117 388 118 372 117 358 Z",
            "M103 358 C97 350 88 350 82 358 C78 370 79 388 82 402 C84 413 86 423 87 432 C92 436 99 436 103 431 C105 421 106 411 105 402 C103 388 102 372 103 358 Z"
          ]
        },
        badges: {
          shoulders: { x: 162, y: 105 },
          upper_back: { x: 110, y: 101 },
          lats: { x: 110, y: 152 },
          lower_back: { x: 110, y: 212 },
          arms: { x: 48, y: 204 },
          glutes: { x: 110, y: 268 },
          hams: { x: 126, y: 330 },
          calves: { x: 126, y: 394 }
        }
      }
    },
    female: {
      front: {
        silhouette: [
          "M110 11 C120 11 128 21 128 35 C128 48 120 60 110 60 C100 60 92 48 92 35 C92 21 100 11 110 11 Z",
          "M110 53 C115 53 119 59 120 70 C131 73 142 78 148 85 C152 91 154 100 152 110 C150 118 146 122 139 125 C136 139 132 153 130 169 C135 187 143 201 145 219 C146 235 142 247 136 255 C128 261 118 263 110 263 C102 263 92 261 84 255 C78 247 74 235 75 219 C77 201 85 187 90 169 C88 153 84 139 81 125 C74 122 70 118 68 110 C66 100 68 91 72 85 C78 78 89 73 100 70 C101 59 105 53 110 53 Z",
          "M141 103 C150 103 156 109 157 118 C160 138 162 158 163 180 C166 206 168 231 167 254 C167 272 164 284 159 290 C154 295 148 292 147 284 C146 270 147 261 148 251 C149 231 148 206 146 182 C144 160 141 138 139 120 C138 110 139 104 141 103 Z",
          "M79 103 C70 103 64 109 63 118 C60 138 58 158 57 180 C54 206 52 231 53 254 C53 272 56 284 61 290 C66 295 72 292 73 284 C74 270 73 261 72 251 C71 231 72 206 74 182 C76 160 79 138 81 120 C82 110 81 104 79 103 Z",
          "M110 248 C122 246 134 251 139 262 C143 282 142 306 139 330 C138 340 136 344 135 350 C139 368 140 386 137 404 C135 421 132 433 130 443 C132 452 137 459 144 463 C146 467 143 469 137 469 L117 469 C112 469 110 465 111 459 C113 445 114 433 113 421 C111 405 110 389 111 373 C112 358 113 352 112 344 C110 328 108 306 108 282 C108 268 109 256 110 248 Z",
          "M110 248 C98 246 86 251 81 262 C77 282 78 306 81 330 C82 340 84 344 85 350 C81 368 80 386 83 404 C85 421 88 433 90 443 C88 452 83 459 76 463 C74 467 77 469 83 469 L103 469 C108 469 110 465 109 459 C107 445 106 433 107 421 C109 405 110 389 109 373 C108 358 107 352 108 344 C110 328 112 306 112 282 C112 268 111 256 110 248 Z"
        ],
        detail: [
          "M99 76 Q105 83 110 80",
          "M121 76 Q115 83 110 80",
          "M106 61 L107 71",
          "M114 61 L113 71",
          "M110 100 L110 126",
          "M96 128 Q104 140 113 134",
          "M124 128 Q116 140 107 134",
          "M110 150 L110 242",
          "M99 170 Q104 166 109 167",
          "M121 170 Q116 166 111 167",
          "M99 190 Q104 186 109 187",
          "M121 190 Q116 186 111 187",
          "M92 160 Q88 176 92 192",
          "M128 160 Q132 176 128 192",
          "M98 226 Q104 238 109 242",
          "M122 226 Q116 238 111 242",
          "M96 250 Q104 258 110 256",
          "M124 250 Q116 258 110 256",
          "M146 98 Q151 110 150 122",
          "M74 98 Q69 110 70 122",
          "M153 142 Q157 158 157 174",
          "M67 142 Q63 158 63 174",
          "M161 202 Q165 220 163 238",
          "M59 202 Q55 220 57 238",
          "M128 272 Q133 304 129 340",
          "M92 272 Q87 304 91 340",
          "M121 278 Q123 308 120 336",
          "M99 278 Q97 308 100 336",
          "M124 352 Q129 358 125 364",
          "M96 352 Q91 358 95 364",
          "M123 372 Q126 402 121 432",
          "M97 372 Q94 402 99 432"
        ],
        regions: {
          shoulders: [
            "M138 84 C147 86 153 92 155 103 C156 113 154 122 150 128 C144 130 138 127 136 121 C133 111 135 93 138 84 Z",
            "M82 84 C73 86 67 92 65 103 C64 113 66 122 70 128 C76 130 82 127 84 121 C87 111 85 93 82 84 Z"
          ],
          chest: [
            "M111 100 C122 97 133 100 139 109 C143 117 142 129 137 137 C132 144 122 148 114 147 C111 147 110 143 110 136 L110 102 Z",
            "M109 100 C98 97 87 100 81 109 C77 117 78 129 83 137 C88 144 98 148 106 147 C109 147 110 143 110 136 L110 102 Z"
          ],
          arms: [
            "M155 128 C158 148 160 166 161 182 C164 206 166 230 165 252 C160 254 156 252 152 248 C151 230 149 208 147 186 C145 168 142 148 139 130 C144 132 150 131 155 128 Z",
            "M65 128 C62 148 60 166 59 182 C56 206 54 230 55 252 C60 254 64 252 68 248 C69 230 71 208 73 186 C75 168 78 148 81 130 C76 132 70 131 65 128 Z"
          ],
          core: [
            "M110 149 C117 149 124 152 129 158 C133 169 133 183 131 197 C129 213 125 231 118 241 C115 246 112 247 110 247 C108 247 105 246 102 241 C95 231 91 213 89 197 C87 183 87 169 91 158 C96 152 103 149 110 149 Z"
          ],
          quads: [
            "M117 258 C126 254 136 259 140 269 C144 284 143 304 140 320 C138 334 136 342 134 350 C128 355 120 354 116 348 C114 330 115 310 116 292 C117 276 117 266 117 258 Z",
            "M103 258 C94 254 84 259 80 269 C76 284 77 304 80 320 C82 334 84 342 86 350 C92 355 100 354 104 348 C106 330 105 310 104 292 C103 276 103 266 103 258 Z"
          ],
          // Sits lower and a touch wider than the male crease — the female
          // pelvis flares further out before the thigh starts.
          hip_flexors: [
            "M115 244 C124 242 133 248 136 258 C137 266 135 274 131 279 C125 279 118 275 116 269 C115 261 115 252 115 244 Z",
            "M105 244 C96 242 87 248 84 258 C83 266 85 274 89 279 C95 279 102 275 104 269 C105 261 105 252 105 244 Z"
          ],
          adductors: [
            "M112 262 C118 265 121 275 121 289 C121 304 119 318 117 328 C114 326 112 320 112 312 C112 296 112 278 112 262 Z",
            "M108 262 C102 265 99 275 99 289 C99 304 101 318 103 328 C106 326 108 320 108 312 C108 296 108 278 108 262 Z"
          ],
          calves: [
            "M117 362 C123 354 131 354 136 362 C140 374 139 392 136 406 C134 416 132 425 131 434 C127 438 121 438 117 433 C115 423 114 413 115 406 C117 392 118 376 117 362 Z",
            "M103 362 C97 354 89 354 84 362 C80 374 81 392 84 406 C86 416 88 425 89 434 C93 438 99 438 103 433 C105 423 106 413 105 406 C103 392 102 376 103 362 Z"
          ]
        },
        badges: {
          shoulders: { x: 146, y: 105 },
          chest: { x: 124, y: 120 },
          arms: { x: 67, y: 200 },
          core: { x: 110, y: 196 },
          hip_flexors: { x: 127, y: 252 },
          adductors: { x: 110, y: 276 },
          quads: { x: 127, y: 304 },
          calves: { x: 126, y: 398 }
        }
      },
      back: {
        silhouette: [
          "M110 11 C120 11 128 21 128 35 C128 48 120 60 110 60 C100 60 92 48 92 35 C92 21 100 11 110 11 Z",
          "M110 53 C115 53 119 59 120 70 C131 73 142 78 148 85 C152 91 154 100 152 110 C150 118 146 122 139 125 C136 139 132 153 130 169 C135 187 143 201 145 219 C146 235 142 247 136 255 C128 261 118 263 110 263 C102 263 92 261 84 255 C78 247 74 235 75 219 C77 201 85 187 90 169 C88 153 84 139 81 125 C74 122 70 118 68 110 C66 100 68 91 72 85 C78 78 89 73 100 70 C101 59 105 53 110 53 Z",
          "M141 103 C150 103 156 109 157 118 C160 138 162 158 163 180 C166 206 168 231 167 254 C167 272 164 284 159 290 C154 295 148 292 147 284 C146 270 147 261 148 251 C149 231 148 206 146 182 C144 160 141 138 139 120 C138 110 139 104 141 103 Z",
          "M79 103 C70 103 64 109 63 118 C60 138 58 158 57 180 C54 206 52 231 53 254 C53 272 56 284 61 290 C66 295 72 292 73 284 C74 270 73 261 72 251 C71 231 72 206 74 182 C76 160 79 138 81 120 C82 110 81 104 79 103 Z",
          "M110 248 C122 246 134 251 139 262 C143 282 142 306 139 330 C138 340 136 344 135 350 C139 368 140 386 137 404 C135 421 132 433 130 443 C132 452 137 459 144 463 C146 467 143 469 137 469 L117 469 C112 469 110 465 111 459 C113 445 114 433 113 421 C111 405 110 389 111 373 C112 358 113 352 112 344 C110 328 108 306 108 282 C108 268 109 256 110 248 Z",
          "M110 248 C98 246 86 251 81 262 C77 282 78 306 81 330 C82 340 84 344 85 350 C81 368 80 386 83 404 C85 421 88 433 90 443 C88 452 83 459 76 463 C74 467 77 469 83 469 L103 469 C108 469 110 465 109 459 C107 445 106 433 107 421 C109 405 110 389 109 373 C108 358 107 352 108 344 C110 328 112 306 112 282 C112 268 111 256 110 248 Z"
        ],
        detail: [
          "M110 73 L110 186",
          "M110 82 L120 98",
          "M110 82 L100 98",
          "M100 106 Q95 116 99 126",
          "M120 106 Q125 116 121 126",
          "M124 138 Q120 158 116 174",
          "M96 138 Q100 158 104 174",
          "M105 192 L105 236",
          "M115 192 L115 236",
          "M146 98 Q151 110 150 122",
          "M74 98 Q69 110 70 122",
          "M153 142 Q157 158 157 174",
          "M67 142 Q63 158 63 174",
          "M161 202 Q165 220 163 238",
          "M59 202 Q55 220 57 238",
          "M86 286 Q97 295 108 290",
          "M134 286 Q123 295 112 290",
          "M126 314 Q128 340 126 368",
          "M94 314 Q92 340 94 368",
          "M117 378 Q124 383 131 377",
          "M103 378 Q96 383 89 377",
          "M124 392 Q127 412 124 430",
          "M96 392 Q93 412 96 430"
        ],
        regions: {
          shoulders: [
            "M138 84 C147 86 153 92 155 103 C156 113 154 122 150 128 C144 130 138 127 136 121 C133 111 135 93 138 84 Z",
            "M82 84 C73 86 67 92 65 103 C64 113 66 122 70 128 C76 130 82 127 84 121 C87 111 85 93 82 84 Z"
          ],
          upper_back: [
            "M110 73 C115 73 119 76 123 80 C132 84 140 90 145 98 C148 105 147 113 143 119 C135 125 125 129 117 131 C112 132 111 128 110 122 C109 128 108 132 103 131 C95 129 85 125 77 119 C73 113 72 105 75 98 C80 90 88 84 97 80 C101 76 105 73 110 73 Z"
          ],
          lats: [
            "M110 133 C118 131 128 127 137 122 C141 131 142 143 139 155 C136 167 131 177 124 184 C119 189 112 188 110 181 C108 188 101 189 96 184 C89 177 84 167 81 155 C78 143 79 131 83 122 C92 127 102 131 110 133 Z"
          ],
          lower_back: [
            "M110 186 C116 186 120 190 122 196 C124 208 123 222 120 232 C117 240 113 242 110 242 C107 242 103 240 100 232 C97 222 96 208 98 196 C100 190 104 186 110 186 Z"
          ],
          arms: [
            "M155 128 C158 148 160 166 161 182 C164 206 166 230 165 252 C160 254 156 252 152 248 C151 230 149 208 147 186 C145 168 142 148 139 130 C144 132 150 131 155 128 Z",
            "M65 128 C62 148 60 166 59 182 C56 206 54 230 55 252 C60 254 64 252 68 248 C69 230 71 208 73 186 C75 168 78 148 81 130 C76 132 70 131 65 128 Z"
          ],
          glutes: [
            "M110 248 C121 243 133 246 140 256 C144 268 143 284 137 295 C131 303 121 305 113 298 C111 296 110 293 110 290 C110 293 109 296 107 298 C99 305 89 303 83 295 C77 284 76 268 80 256 C87 246 99 243 110 248 Z"
          ],
          hams: [
            "M117 306 C125 302 134 304 139 312 C142 324 141 340 138 354 C136 364 133 371 130 375 C125 379 119 378 116 373 C115 357 115 340 116 326 C116 317 117 311 117 306 Z",
            "M103 306 C95 302 86 304 81 312 C78 324 79 340 82 354 C84 364 87 371 90 375 C95 379 101 378 104 373 C105 357 105 340 104 326 C104 317 103 311 103 306 Z"
          ],
          calves: [
            "M117 362 C123 354 131 354 136 362 C140 374 139 392 136 406 C134 416 132 425 131 434 C127 438 121 438 117 433 C115 423 114 413 115 406 C117 392 118 376 117 362 Z",
            "M103 362 C97 354 89 354 84 362 C80 374 81 392 84 406 C86 416 88 425 89 434 C93 438 99 438 103 433 C105 423 106 413 105 406 C103 392 102 376 103 362 Z"
          ]
        },
        badges: {
          shoulders: { x: 146, y: 105 },
          upper_back: { x: 110, y: 99 },
          lats: { x: 110, y: 150 },
          lower_back: { x: 110, y: 208 },
          arms: { x: 67, y: 200 },
          glutes: { x: 110, y: 270 },
          hams: { x: 126, y: 336 },
          calves: { x: 126, y: 398 }
        }
      }
    }
  };

  const SEXES = ["male", "female"];
  function normSex(s) { return s === "female" ? "female" : "male"; }

  /** Does an exercise belong to this zone? */
  function exerciseMatchesZone(ex, zoneId) {
    const z = ZONES[zoneId];
    if (!z) return false;
    if (z.coarse) return (ex.category || "") === z.category;
    const hay = `${ex.name || ""} ${(ex.muscles || []).join(" ")}`;
    return !!(z.muscleMatch && z.muscleMatch.test(hay));
  }

  /** Count exercises per zone id. */
  function countByZone(exercises) {
    const counts = {};
    for (const id of Object.keys(ZONES)) {
      counts[id] = exercises.filter(ex => exerciseMatchesZone(ex, id)).length;
    }
    return counts;
  }

  /**
   * Heat intensity 0–1 per zone from recent completed sets.
   * @param {Array} workouts completed workouts
   * @param {Map|Object} exerciseById
   * @param {number} days lookback
   * @param {object} [opts]
   * @param {(ex: object) => boolean} [opts.include] Keep only matching exercises
   *        (e.g. exclude mobility so stretching doesn't read as "trained hard").
   */
  function heatFromWorkouts(workouts, exerciseById, days = 14, opts = {}) {
    const include = typeof opts.include === "function" ? opts.include : null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const sets = {};
    for (const id of Object.keys(ZONES)) sets[id] = 0;

    const getDef = (id) => {
      if (!exerciseById) return null;
      if (typeof exerciseById.get === "function") return exerciseById.get(id);
      return exerciseById[id];
    };

    for (const w of workouts || []) {
      if (!w.completedAt) continue;
      const d = w.date ? new Date(w.date) : new Date(w.completedAt);
      if (d < cutoff) continue;
      for (const ex of (w.exercises || [])) {
        const def = getDef(ex.exerciseId) || {
          id: ex.exerciseId, name: ex.name || "", category: ex.category || "", muscles: ex.muscles || []
        };
        // Prefer library definition muscles
        const merged = {
          name: def.name || ex.name || "",
          category: def.category || ex.category || "",
          muscles: (def.muscles && def.muscles.length) ? def.muscles : (ex.muscles || [])
        };
        if (include && !include({ ...merged, id: def.id || ex.exerciseId, type: def.type || ex.type })) continue;
        const done = (ex.sets || []).filter(s => s.done).length || (ex.sets || []).length || 0;
        if (!done) continue;
        for (const id of Object.keys(ZONES)) {
          if (exerciseMatchesZone(merged, id)) sets[id] += done;
        }
      }
    }

    const max = Math.max(1, ...Object.values(sets));
    const heat = {};
    for (const id of Object.keys(sets)) {
      heat[id] = sets[id] / max; // 0–1
      heat[id + "_sets"] = sets[id];
    }
    return heat;
  }

  function svgEl(name, attrs) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        n.setAttribute(k, String(v));
      }
    }
    return n;
  }

  // Region parts are plain path strings, but tolerate the {type, d} / ellipse
  // shape older geometry used so a stray entry can't blank the whole figure.
  function appendPart(parent, part, className) {
    if (typeof part === "string") {
      parent.appendChild(svgEl("path", { d: part, class: className }));
      return;
    }
    if (part && part.type === "ellipse") {
      parent.appendChild(svgEl("ellipse", { cx: part.cx, cy: part.cy, rx: part.rx, ry: part.ry, class: className }));
      return;
    }
    if (part && part.d) parent.appendChild(svgEl("path", { d: part.d, class: className }));
  }

  /**
   * @param {object} opts
   * @param {(sel: {zoneId:string, category:string}) => void} opts.onSelect
   * @param {"male"|"female"} [opts.sex]           figure to draw
   * @param {(sex: string) => void} [opts.onSexChange]
   * @param {Record<string, number>} [opts.counts]
   * @param {Record<string, number>} [opts.heat]  zoneId → 0–1
   * @param {boolean} [opts.heatEnabled]
   * @param {string} [opts.activeZone]
   * @param {boolean} [opts.showSexToggle]        default true
   */
  function create(opts) {
    const onSelect = opts.onSelect || (() => {});
    const onSexChange = opts.onSexChange || (() => {});
    let counts = opts.counts || {};
    let heat = opts.heat || {};
    let heatEnabled = opts.heatEnabled !== false;
    let activeZone = opts.activeZone || "all";
    let view = opts.view === "back" ? "back" : "front";
    let figureSex = normSex(opts.sex);

    const root = document.createElement("div");
    root.className = "body-map";
    root.setAttribute("data-testid", "body-map");

    // Header: title + front/back
    const header = document.createElement("div");
    header.className = "body-map-header";

    const title = document.createElement("div");
    title.className = "body-map-title";
    title.textContent = "Body map";

    const toggle = document.createElement("div");
    toggle.className = "body-map-toggle";
    toggle.setAttribute("role", "group");
    toggle.setAttribute("aria-label", "Body view");

    const frontBtn = document.createElement("button");
    frontBtn.type = "button";
    frontBtn.className = "body-map-toggle-btn";
    frontBtn.textContent = "Front";
    frontBtn.setAttribute("data-testid", "body-map-front");

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "body-map-toggle-btn";
    backBtn.textContent = "Back";
    backBtn.setAttribute("data-testid", "body-map-back");

    toggle.appendChild(frontBtn);
    toggle.appendChild(backBtn);

    // Figure toggle — the map should look like the person reading it. Kept on
    // its own row so the header doesn't crowd on a narrow phone.
    const sexToggle = document.createElement("div");
    sexToggle.className = "body-map-toggle body-map-sex";
    sexToggle.setAttribute("role", "group");
    sexToggle.setAttribute("aria-label", "Body figure");
    const maleBtn = document.createElement("button");
    maleBtn.type = "button";
    maleBtn.className = "body-map-toggle-btn";
    maleBtn.textContent = "Male";
    maleBtn.setAttribute("data-testid", "body-map-male");
    const femaleBtn = document.createElement("button");
    femaleBtn.type = "button";
    femaleBtn.className = "body-map-toggle-btn";
    femaleBtn.textContent = "Female";
    femaleBtn.setAttribute("data-testid", "body-map-female");
    sexToggle.appendChild(maleBtn);
    sexToggle.appendChild(femaleBtn);

    header.appendChild(title);
    header.appendChild(toggle);
    root.appendChild(header);
    if (opts.showSexToggle !== false) {
      const sexRow = document.createElement("div");
      sexRow.className = "body-map-sexrow";
      sexRow.appendChild(sexToggle);
      root.appendChild(sexRow);
    }

    // Heat toolbar
    const tools = document.createElement("div");
    tools.className = "body-map-tools";

    const heatLabel = document.createElement("label");
    heatLabel.className = "body-map-heat-toggle";
    heatLabel.setAttribute("data-testid", "body-map-heat-toggle");
    const heatCb = document.createElement("input");
    heatCb.type = "checkbox";
    heatCb.checked = heatEnabled;
    heatCb.setAttribute("data-testid", "body-map-heat-checkbox");
    const heatText = document.createElement("span");
    heatText.textContent = "Recent training heat (14 days)";
    heatLabel.appendChild(heatCb);
    heatLabel.appendChild(heatText);
    tools.appendChild(heatLabel);

    const heatLegend = document.createElement("div");
    heatLegend.className = "body-map-heat-legend";
    heatLegend.innerHTML =
      '<span class="body-map-heat-swatch cold"></span>Quiet' +
      '<span class="body-map-heat-swatch warm"></span>' +
      '<span class="body-map-heat-swatch hot"></span>Busy';
    tools.appendChild(heatLegend);
    root.appendChild(tools);

    const stage = document.createElement("div");
    stage.className = "body-map-stage";
    root.appendChild(stage);

    const status = document.createElement("div");
    status.className = "body-map-status";
    status.setAttribute("data-testid", "body-map-status");
    root.appendChild(status);

    const legend = document.createElement("div");
    legend.className = "body-map-legend";
    legend.textContent = "Tap a muscle zone to filter. Tap again to clear. Finer zones on Back: lats, glutes, hams.";
    root.appendChild(legend);

    function geoFor() {
      const bySex = GEOMETRY[figureSex] || GEOMETRY.male;
      return bySex[view] || bySex.front;
    }

    function zoneCount(id) {
      const n = counts[id];
      return typeof n === "number" ? n : 0;
    }

    function heatLevel(id) {
      if (!heatEnabled) return 0;
      const h = heat[id];
      return typeof h === "number" ? h : 0;
    }

    function heatClass(id) {
      if (!heatEnabled) return "";
      const h = heatLevel(id);
      if (h <= 0) return "heat-0";
      if (h < 0.25) return "heat-1";
      if (h < 0.5) return "heat-2";
      if (h < 0.75) return "heat-3";
      return "heat-4";
    }

    function statusText() {
      if (!activeZone || activeZone === "all") {
        return "Showing all exercises — tap a muscle zone";
      }
      const z = ZONES[activeZone];
      const label = z ? z.label : activeZone;
      const n = zoneCount(activeZone);
      const sets = heat[activeZone + "_sets"] || 0;
      let s = n > 0 ? `Showing ${label} · ${n} exercise${n === 1 ? "" : "s"}` : `Showing ${label}`;
      if (heatEnabled && sets > 0) {
        s += ` · ${sets} set${sets === 1 ? "" : "s"} in 14 days`;
      }
      return s;
    }

    function paintToggle() {
      maleBtn.classList.toggle("active", figureSex === "male");
      femaleBtn.classList.toggle("active", figureSex === "female");
      maleBtn.setAttribute("aria-pressed", figureSex === "male" ? "true" : "false");
      femaleBtn.setAttribute("aria-pressed", figureSex === "female" ? "true" : "false");
      frontBtn.classList.toggle("active", view === "front");
      backBtn.classList.toggle("active", view === "back");
      frontBtn.setAttribute("aria-pressed", view === "front" ? "true" : "false");
      backBtn.setAttribute("aria-pressed", view === "back" ? "true" : "false");
      root.classList.toggle("heat-on", heatEnabled);
    }

    function paintRegions() {
      // Which zone ids should appear selected?
      // Coarse category selection (chip) highlights all fine zones of that category.
      const active = activeZone || "all";

      stage.querySelectorAll(".body-map-region").forEach(g => {
        const id = g.getAttribute("data-zone");
        const z = ZONES[id];
        let on = false;
        if (active === "all") on = false;
        else if (active === id) on = true;
        else if (z && ZONES[active] && ZONES[active].coarse && z.category === ZONES[active].category) on = true;
        // Selecting "back" chip → highlight upper_back + lats + lower_back
        else if (active === "back" && z && z.category === "back") on = true;
        else if (active === "legs" && z && z.category === "legs") on = true;

        g.classList.toggle("is-active", on);
        g.setAttribute("aria-pressed", on ? "true" : "false");

        // Mirror active state onto the zone's badge (lives on the top layer)
        const badge = stage.querySelector(`[data-zone-badge="${id}"]`);
        if (badge) badge.classList.toggle("is-active", on);

        // Heat class on parts
        const hc = heatClass(id);
        g.classList.remove("heat-0", "heat-1", "heat-2", "heat-3", "heat-4");
        if (hc) g.classList.add(hc);
      });

      stage.classList.toggle("has-selection", !!(active && active !== "all"));
      status.textContent = statusText();
      heatLegend.style.opacity = heatEnabled ? "1" : "0.35";
    }

    function preferredViewFor(zoneId) {
      const z = ZONES[zoneId];
      if (!z) return view;
      if (z.views.includes(view)) return view;
      if (z.views.includes("back")) return "back";
      if (z.views.includes("front")) return "front";
      // Coarse-only zones: pick a sensible view
      if (zoneId === "back") return "back";
      if (zoneId === "legs") return view;
      if (zoneId === "chest" || zoneId === "core") return "front";
      return view;
    }

    function setActiveZone(next, notify) {
      activeZone = next;
      // Auto-flip view when needed
      if (next !== "all") {
        const pref = preferredViewFor(next);
        if (pref !== view) {
          view = pref;
          paintToggle();
          renderSvg(); // calls paintRegions at the end
        } else {
          paintRegions();
        }
      } else {
        paintRegions();
      }
      if (!notify) return;
      const z = ZONES[next];
      onSelect({
        zoneId: next,
        category: next === "all" ? "all" : (z ? z.category : next),
        coarse: next === "all" ? true : !!(z && z.coarse)
      });
    }

    function selectZone(id) {
      setActiveZone(activeZone === id ? "all" : id, true);
    }

    function renderSvg() {
      stage.innerHTML = "";
      const geo = geoFor();

      const svg = svgEl("svg", {
        viewBox: "0 0 220 480",
        class: "body-map-svg",
        role: "img",
        "aria-label": `Body map, ${figureSex} figure, ${view} view`
      });

      // Soft ground under the feet
      svg.appendChild(svgEl("ellipse", {
        cx: 110, cy: 473, rx: figureSex === "female" ? 52 : 56, ry: 6,
        class: "body-map-ground"
      }));

      // Continuous anatomical silhouette (skin underlay)
      const under = svgEl("g", { class: "body-map-underlay", "aria-hidden": "true" });
      for (const d of (geo.silhouette || [])) {
        under.appendChild(svgEl("path", { d, class: "body-map-underlay-part" }));
      }
      svg.appendChild(under);

      // Interactive regions for this view
      const badgeLayer = svgEl("g", { class: "body-map-badges", "aria-hidden": "true" });
      for (const zoneId of Object.keys(geo.regions)) {
        const z = ZONES[zoneId];
        if (!z) continue;
        const g = svgEl("g", {
          class: "body-map-region",
          "data-zone": zoneId,
          role: "button",
          tabindex: "0",
          "aria-label": `${z.label}${zoneCount(zoneId) ? `, ${zoneCount(zoneId)} exercises` : ""}`,
          "aria-pressed": "false"
        });

        for (const part of (geo.regions[zoneId] || [])) {
          appendPart(g, part, "body-map-region-part");
        }

        // Count badge (rendered on the top layer so contour lines never cross it)
        const pos = (geo.badges && geo.badges[zoneId]) || null;
        const n = zoneCount(zoneId);
        if (pos && n > 0) {
          const badge = svgEl("g", { class: "body-map-badge", "data-zone-badge": zoneId, "aria-hidden": "true" });
          badge.appendChild(svgEl("circle", { cx: pos.x, cy: pos.y, r: 10, class: "body-map-badge-bg" }));
          const t = svgEl("text", {
            x: pos.x, y: pos.y + 3.5,
            "text-anchor": "middle",
            class: "body-map-badge-text"
          });
          t.textContent = String(n);
          badge.appendChild(t);
          badgeLayer.appendChild(badge);
        }

        g.addEventListener("click", (e) => { e.preventDefault(); selectZone(zoneId); });
        g.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectZone(zoneId); }
        });

        svg.appendChild(g);
      }

      // Fine muscle-contour lines drawn over the zones (non-interactive)
      if (geo.detail && geo.detail.length) {
        const detailG = svgEl("g", { class: "body-map-detail", "aria-hidden": "true" });
        for (const d of geo.detail) {
          detailG.appendChild(svgEl("path", { d, class: "body-map-detail-line", fill: "none" }));
        }
        svg.appendChild(detailG);
      }

      // Count badges on top so no lines cross them
      svg.appendChild(badgeLayer);

      stage.appendChild(svg);
      paintRegions();
    }

    function setSexInternal(next, notify) {
      const s = normSex(next);
      if (s === figureSex) return;
      figureSex = s;
      paintToggle();
      renderSvg();
      if (notify) onSexChange(figureSex);
    }

    maleBtn.addEventListener("click", () => setSexInternal("male", true));
    femaleBtn.addEventListener("click", () => setSexInternal("female", true));

    frontBtn.addEventListener("click", () => {
      if (view === "front") return;
      view = "front";
      paintToggle();
      renderSvg();
    });
    backBtn.addEventListener("click", () => {
      if (view === "back") return;
      view = "back";
      paintToggle();
      renderSvg();
    });

    heatCb.addEventListener("change", () => {
      heatEnabled = heatCb.checked;
      paintToggle();
      paintRegions();
      onSelect({
        zoneId: activeZone,
        category: activeZone === "all" ? "all" : (ZONES[activeZone] ? ZONES[activeZone].category : activeZone),
        coarse: activeZone === "all" ? true : !!(ZONES[activeZone] && ZONES[activeZone].coarse),
        heatOnly: true
      });
    });

    paintToggle();
    renderSvg();

    return {
      el: root,
      ZONES,
      setActive(zoneId) { setActiveZone(zoneId || "all", false); },
      // Drop the zone filter without echoing back through onSelect — the caller
      // clearing filters is already re-rendering.
      clear() { setActiveZone("all", false); },
      setView(v) {
        if (v !== "front" && v !== "back") return;
        if (view === v) return;
        view = v;
        paintToggle();
        renderSvg();
      },
      setSex(s) { setSexInternal(s, false); },
      getSex() { return figureSex; },
      setHeat(nextHeat) { heat = nextHeat || {}; paintRegions(); },
      setCounts(nextCounts) { counts = nextCounts || {}; renderSvg(); },
      setHeatEnabled(on) {
        heatEnabled = !!on;
        heatCb.checked = heatEnabled;
        paintToggle();
        paintRegions();
      },
      getActive() { return activeZone; }
    };
  }

  return { create, ZONES, SEXES, GEOMETRY, exerciseMatchesZone, countByZone, heatFromWorkouts };
})();
