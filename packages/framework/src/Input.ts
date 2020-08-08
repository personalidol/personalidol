import type { TypedArrayMap } from "./TypedArrayMap.type";

let index = 0;

const code: TypedArrayMap = {};

const touchesTotal = 3;
const rangeMouseMin = 0;

// mouse
code["M_BUTTON_L"] = index++;
code["M_BUTTON_R"] = index++;
code["M_BUTTON_M"] = index++;
code["M_BUTTON_4"] = index++;
code["M_BUTTON_5"] = index++;
code["M_IN_BOUNDS"] = index++;
code["M_CLIENT_X"] = index++;
code["M_CLIENT_Y"] = index++;
code["M_RELATIVE_X"] = index++;
code["M_RELATIVE_Y"] = index++;
code["M_VECTOR_X"] = index++;
code["M_VECTOR_Y"] = index++;

const rangeMouseMax = index - 1;
const rangeTouch1Min = index;
const rangeTouchesMin = rangeTouch1Min;

// touch point 1
code["T0_CLIENT_X"] = index++;
code["T0_CLIENT_Y"] = index++;
code["T0_IN_BOUNDS"] = index++;
code["T0_PRESSURE"] = index++;
code["T0_RELATIVE_X"] = index++;
code["T0_RELATIVE_Y"] = index++;
code["T0_VECTOR_X"] = index++;
code["T0_VECTOR_Y"] = index++;

const rangeTouch1Max = index - 1;
const rangeTouch2Min = index;

// touch point 2
code["T1_CLIENT_X"] = index++;
code["T1_CLIENT_Y"] = index++;
code["T1_IN_BOUNDS"] = index++;
code["T1_PRESSURE"] = index++;
code["T1_RELATIVE_X"] = index++;
code["T1_RELATIVE_Y"] = index++;
code["T1_VECTOR_X"] = index++;
code["T1_VECTOR_Y"] = index++;

const rangeTouch2Max = index - 1;
const rangeTouch3Min = index;

// touch point 3
code["T2_CLIENT_X"] = index++;
code["T2_CLIENT_Y"] = index++;
code["T2_IN_BOUNDS"] = index++;
code["T2_PRESSURE"] = index++;
code["T2_RELATIVE_X"] = index++;
code["T2_RELATIVE_Y"] = index++;
code["T2_VECTOR_X"] = index++;
code["T2_VECTOR_Y"] = index++;

const rangeTouch3Max = index - 1;
const rangeTouchesMax = rangeTouch3Max;

const touches: {
  [key: number]: {
    [key: string]: string;
  };
} = {};

for (let i = 0; i < touchesTotal; i += 1) {
  touches[i] = {
    CLIENT_X: `T${i}_CLIENT_X`,
    CLIENT_Y: `T${i}_CLIENT_Y`,
    IN_BOUNDS: `T${i}_IN_BOUNDS`,
    PRESSURE: `T${i}_PRESSURE`,
    RELATIVE_X: `T${i}_RELATIVE_X`,
    RELATIVE_Y: `T${i}_RELATIVE_Y`,
    VECTOR_X: `T${i}_VECTOR_X`,
    VECTOR_Y: `T${i}_VECTOR_Y`,
  };
}

/**
 * Why uint8? To support pressure force. Standards normalize pressure to be
 * between 0 and 1, but here it's stretched between 0 and 100.
 */
function createEmptyState(): Int16Array {
  return new Int16Array(Object.keys(code).length);
}

export const Input = Object.freeze({
  code: Object.freeze(code),
  range: Object.freeze({
    mouse_min: rangeMouseMin,
    mouse_max: rangeMouseMax,

    touches_min: rangeTouchesMin,
    touches_max: rangeTouchesMax,
    touches_total: touchesTotal,

    touch1_min: rangeTouch1Min,
    touch1_max: rangeTouch1Max,

    touch2_min: rangeTouch2Min,
    touch2_max: rangeTouch2Max,

    touch3_min: rangeTouch3Min,
    touch3_max: rangeTouch3Max,
  }),
  touches: touches,
  vector_scale: 32000,

  createEmptyState: createEmptyState,
});