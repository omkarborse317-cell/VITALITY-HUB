const asanaArt = {
  'Mountain Pose': 'mountain',
  'Tree Pose': 'tree',
  "Child's Pose": 'child',
  'Cat Pose': 'cat',
  'Cow Pose': 'cow',
  'Cat-Cow Flow': 'cat-cow',
  'Downward-Facing Dog': 'down-dog',
  'Cobra Pose': 'cobra',
  'Bridge Pose': 'bridge',
  'Warrior I': 'warrior-one',
  'Warrior II': 'warrior-two',
  'Triangle Pose': 'triangle',
  'Easy Seated Pose': 'easy-seat',
  'Bound Angle Pose': 'bound-angle',
  'Seated Forward Fold': 'seated-fold',
  'Thunderbolt Pose': 'kneeling',
  'Seated Twist': 'twist',
  'Chair Pose': 'chair',
  'Low Lunge': 'lunge',
  'Garland Pose': 'garland',
  'Resting Pose': 'rest',
  'Standing Forward Fold': 'standing-fold',
  'Plank Pose': 'plank',
  'Knees-to-Chest Pose': 'knees-to-chest',
  'Staff Pose': 'staff',
  'Supported Relaxation Pose': 'supported-rest',
};

const practiceArt = {
  'Diaphragmatic Breathing': 'diaphragm',
  'Equal Breathing': 'equal-breath',
  'Extended Exhale': 'extended-exhale',
  'Alternate Nostril Breathing': 'alternate-nostril',
  'Humming Bee Breath': 'humming',
  'Ocean Breath': 'ocean',
  'Box Breathing': 'box-breath',
  'Mindful Natural Breath': 'natural-breath',
  'Body Scan': 'body-scan',
  'Breath Awareness': 'breath-awareness',
  'Loving-Kindness': 'kindness',
  'Five-Senses Grounding': 'senses',
  'Mindful Walking': 'walking',
  'Sound Meditation': 'sound',
  'Gratitude Reflection': 'gratitude',
  'Quiet Pause': 'pause',
};

function Line({ d, className = '' }) {
  return <path className={`illustration-line ${className}`} d={d} />;
}

function Person({ head, body, leftArm, rightArm, leftLeg, rightLeg, extra }) {
  return (
    <g>
      {extra}
      <Line d={body} className="illustration-body" />
      <Line d={leftArm} />
      <Line d={rightArm} />
      <Line d={leftLeg} />
      <Line d={rightLeg} />
      <circle className="illustration-head" cx={head[0]} cy={head[1]} r="9" />
    </g>
  );
}

function AsanaFigure({ pose }) {
  switch (pose) {
    case 'mountain':
      return <Person head={[120, 34]} body="M120 46v40" leftArm="M120 53 98 85" rightArm="M120 53 142 85" leftLeg="M120 86 105 126" rightLeg="M120 86 135 126" />;
    case 'tree':
      return <Person head={[120, 31]} body="M120 43v42" leftArm="M120 58 100 37 120 20" rightArm="M120 58 140 37 120 20" leftLeg="M120 85 105 126" rightLeg="M120 85 145 105 124 96" />;
    case 'child':
      return <Person head={[83, 83]} body="M91 84q27-6 45 10" leftArm="M130 94 170 108" rightArm="M130 94 169 119" leftLeg="M126 92 102 117 83 116" rightLeg="M126 92 105 130 82 129" />;
    case 'cat':
    case 'cow':
    case 'cat-cow':
      return <Person head={[72, 82]} body={pose === 'cat' ? "M83 82q31-22 61 0" : "M83 82q31 18 61 0"} leftArm="M93 79 90 111" rightArm="M137 79 140 111" leftLeg="M90 111 76 128" rightLeg="M140 111 155 128" />;
    case 'down-dog':
      return <Person head={[62, 95]} body="M71 92 119 58 164 89" leftArm="M77 87 54 125" rightArm="M88 82 73 126" leftLeg="M164 89 183 126" rightLeg="M153 83 165 126" />;
    case 'cobra':
      return <Person head={[76, 92]} body="M83 101q28-26 58-9" leftArm="M99 91 88 119" rightArm="M112 87 116 118" leftLeg="M140 92 176 111" rightLeg="M139 99 178 122" />;
    case 'bridge':
      return <Person head={[57, 112]} body="M68 112q40-50 81-4" leftArm="M71 113 90 130" rightArm="M94 110 101 130" leftLeg="M148 108 169 94 186 126" rightLeg="M143 110 158 94 176 126" />;
    case 'warrior-one':
      return <Person head={[120, 32]} body="M120 44v41" leftArm="M120 56 102 39 120 20" rightArm="M120 56 138 39 120 20" leftLeg="M120 85 100 124 86 129" rightLeg="M120 85 151 106 169 111" />;
    case 'warrior-two':
      return <Person head={[120, 31]} body="M120 43v43" leftArm="M120 55 75 57" rightArm="M120 55 165 57" leftLeg="M120 86 94 119 78 119" rightLeg="M120 86 144 101 166 119" />;
    case 'triangle':
      return <Person head={[128, 31]} body="M128 43 117 79" leftArm="M124 52 89 36 72 31" rightArm="M119 67 157 48 174 43" leftLeg="M117 79 93 112 77 117" rightLeg="M117 79 146 113 168 117" />;
    case 'easy-seat':
    case 'bound-angle':
    case 'staff':
      return <Person head={[120, 32]} body="M120 44v43" leftArm="M120 57 103 86 94 106" rightArm="M120 57 137 86 146 106" leftLeg={pose === 'bound-angle' ? "M120 87 104 105 120 116 136 105" : "M120 87 100 107 84 111"} rightLeg={pose === 'staff' ? "M120 87 151 111 179 112" : "M120 87 140 107 156 111"} />;
    case 'seated-fold':
      return <Person head={[155, 60]} body="M150 68 122 88" leftArm="M139 77 111 103" rightArm="M132 82 98 108" leftLeg="M122 88 91 105 69 108" rightLeg="M122 88 92 117 70 119" />;
    case 'kneeling':
      return <Person head={[120, 34]} body="M120 46v41" leftArm="M120 58 101 85" rightArm="M120 58 139 85" leftLeg="M120 87 105 108 91 108" rightLeg="M120 87 135 108 150 108" />;
    case 'twist':
      return <Person head={[124, 33]} body="M120 45 124 86" leftArm="M121 58 94 83 107 101" rightArm="M121 58 149 73 163 60" leftLeg="M124 86 99 105 85 109" rightLeg="M124 86 145 104 161 108" />;
    case 'chair':
      return <Person head={[120, 32]} body="M120 44 121 81" leftArm="M120 56 101 35 86 24" rightArm="M120 56 139 35 154 24" leftLeg="M121 81 101 98 107 123" rightLeg="M121 81 143 98 137 123" extra={<path className="illustration-prop" d="M94 100v30h55v-30" />} />;
    case 'lunge':
      return <Person head={[120, 32]} body="M120 44v40" leftArm="M120 56 101 36 97 22" rightArm="M120 56 139 36 143 22" leftLeg="M120 84 100 105 82 106" rightLeg="M120 84 143 102 164 120" />;
    case 'garland':
      return <Person head={[120, 43]} body="M120 55v27" leftArm="M120 62 101 76 118 88" rightArm="M120 62 139 76 122 88" leftLeg="M120 82 101 99 91 122" rightLeg="M120 82 139 99 149 122" />;
    case 'rest':
    case 'supported-rest':
      return <Person head={[49, 105]} body="M61 107h76" leftArm="M78 107 73 127" rightArm="M103 107 100 127" leftLeg="M137 107 158 91 177 105" rightLeg="M137 107 160 120 181 116" extra={pose === 'supported-rest' ? <path className="illustration-prop" d="M77 93h95" /> : null} />;
    case 'standing-fold':
      return <Person head={[158, 68]} body="M151 75 127 87" leftArm="M141 78 112 106" rightArm="M135 83 101 107" leftLeg="M127 87 104 116 95 127" rightLeg="M127 87 145 116 155 127" />;
    case 'plank':
      return <Person head={[59, 73]} body="M69 77 139 82" leftArm="M76 78 61 112" rightArm="M89 79 77 113" leftLeg="M139 82 171 105 182 124" rightLeg="M132 83 158 110 169 127" extra={<path className="illustration-prop" d="M48 116h42" />} />;
    case 'knees-to-chest':
      return <Person head={[54, 107]} body="M66 108q25-15 56-3" leftArm="M75 105 105 77" rightArm="M88 105 115 80" leftLeg="M122 105 142 84 154 92" rightLeg="M122 105 144 95 156 103" />;
    default:
      return <Person head={[120, 34]} body="M120 46v40" leftArm="M120 56 100 84" rightArm="M120 56 140 84" leftLeg="M120 86 103 126" rightLeg="M120 86 137 126" />;
  }
}

function BreathFigure({ practice }) {
  if (practice === 'alternate-nostril') {
    return <g><path className="illustration-face" d="M105 111q15-54 30 0m-15-21v20l-8 7h16" /><path className="illustration-accent" d="M74 84q-16 17 0 34m92-34q16 17 0 34" /><path className="illustration-flow" d="M62 101h25m66 0h25" /></g>;
  }
  if (practice === 'humming') {
    return <g><circle className="illustration-head" cx="120" cy="83" r="24" /><path className="illustration-face" d="M113 85h14" /><path className="illustration-flow" d="M153 72q20 11 0 22m10-31q31 20 0 40m-86-31q-20 11 0 22M67 63Q36 83 67 103" /></g>;
  }
  if (practice === 'ocean') {
    return <g><path className="illustration-flow" d="M45 70q18-19 36 0t36 0 36 0 36 0m-144 20q18-19 36 0t36 0 36 0 36 0m-144 20q18-19 36 0t36 0 36 0 36 0" /></g>;
  }
  if (practice === 'box-breath') {
    return <g><rect className="illustration-accent" x="75" y="48" width="90" height="72" rx="8" /><path className="illustration-flow" d="M82 42V29m0 0-6 8m6-8 6 8m91 16h13m0 0-8-6m8 6-8 6m-6 71v13m0 0-6-8m6 8 6-8m-96-6H67m0 0 8 6m-8-6 8-6" /></g>;
  }
  if (practice === 'equal-breath' || practice === 'extended-exhale') {
    return <g><circle className="illustration-glow" cx="120" cy="84" r="36" /><path className="illustration-flow" d={practice === 'equal-breath' ? "M57 75h48m30 0h48M57 95h48m30 0h48" : "M75 75h35m15 0h50M75 95h35m15 0h50"} /><path className="illustration-accent" d="M107 84h26" /></g>;
  }
  if (practice === 'diaphragm') {
    return <g><circle className="illustration-head" cx="120" cy="44" r="12" /><path className="illustration-body" d="M120 56v29m-25 10q25-22 50 0m-47 4q22 17 44 0" /><path className="illustration-flow" d="M75 84q-18 18 0 36m90-36q18 18 0 36" /></g>;
  }
  return <g><circle className="illustration-glow" cx="120" cy="84" r="21" /><circle className="illustration-accent" cx="120" cy="84" r="38" /><circle className="illustration-flow" cx="120" cy="84" r="55" /></g>;
}

function MeditationFigure({ practice }) {
  if (practice === 'body-scan') {
    return <g><circle className="illustration-head" cx="120" cy="45" r="12" /><path className="illustration-body" d="M120 58v56m-22-39 22 10 22-10m-22 39-19 25m19-25 19 25" /><circle className="illustration-glow" cx="120" cy="46" r="20" /><circle className="illustration-glow" cx="120" cy="81" r="12" /><circle className="illustration-glow" cx="120" cy="116" r="12" /></g>;
  }
  if (practice === 'walking') {
    return <g><path className="illustration-flow" d="M53 112h133" /><path className="illustration-foot" d="M75 91q9-9 15 2l8 15q-12 8-22-2zm57-28q9-9 15 2l8 15q-12 8-22-2z" /><circle className="illustration-glow" cx="120" cy="47" r="28" /></g>;
  }
  if (practice === 'kindness') {
    return <g><path className="illustration-heart" d="M120 116 75 78q-20-27 7-38 22-5 38 18 16-23 38-18 27 11 7 38z" /><path className="illustration-accent" d="M120 132v-16m-22 0q22-19 44 0" /></g>;
  }
  if (practice === 'senses') {
    return <g><circle className="illustration-glow" cx="120" cy="83" r="36" /><path className="illustration-eye" d="M69 83q23-27 46 0-23 27-46 0zm66 0q23-27 46 0-23 27-46 0z" /><circle className="illustration-accent" cx="92" cy="83" r="5" /><circle className="illustration-accent" cx="162" cy="83" r="5" /><path className="illustration-flow" d="M120 31v17m0 71v17" /></g>;
  }
  if (practice === 'sound') {
    return <g><path className="illustration-flow" d="M55 85h18l18-21v42L73 85H55m79 0h13m-13-14q20 14 0 28m8-41q37 27 0 54m8-67q54 40 0 80" /></g>;
  }
  if (practice === 'gratitude') {
    return <g><path className="illustration-body" d="M120 120V72m0 22Q87 92 86 63q31-1 34 31m0 11q32-2 34-31-30-2-34 31" /><path className="illustration-prop" d="M93 123h54" /><circle className="illustration-glow" cx="120" cy="58" r="13" /></g>;
  }
  if (practice === 'pause') {
    return <g><circle className="illustration-accent" cx="120" cy="86" r="42" /><path className="illustration-face" d="M120 60v27l19 12" /><path className="illustration-prop" d="M108 35h24" /></g>;
  }
  return <g><circle className="illustration-glow" cx="120" cy="84" r="24" /><circle className="illustration-accent" cx="120" cy="84" r="45" /><circle className="illustration-flow" cx="120" cy="84" r="65" /></g>;
}

export default function PracticeIllustration({ name, type }) {
  const isAsana = type === 'asana';
  const pose = asanaArt[name] || 'mountain';
  const practice = practiceArt[name] || 'natural-breath';
  const label = `${name} illustration`;

  return (
    <svg className={`practice-image practice-illustration ${isAsana ? `asana-art art-${pose}` : `art-${practice}`}`} viewBox="0 0 240 160" role="img" aria-label={label}>
      <rect className="illustration-background" x="0" y="0" width="240" height="160" rx="16" />
      <circle className="illustration-sun" cx="193" cy="32" r="17" />
      <path className="illustration-hill" d="M0 127q48-27 90-7t78-4q33-16 72 2v42H0z" />
      <path className="illustration-ground" d="M0 145q61-16 117-4t123-5v24H0z" />
      {isAsana ? <AsanaFigure pose={pose} /> : type === 'pranayama' ? <BreathFigure practice={practice} /> : <MeditationFigure practice={practice} />}
    </svg>
  );
}
