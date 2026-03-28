import * as THREE from "three";

const EMISSIVE_TINT_BY_INSTANCE_COLOR = "totalEmissiveRadiance *= vColor.rgb;";

export const patchEmissiveByInstanceColor = (shader: THREE.Shader) => {
  if (shader.fragmentShader.includes(EMISSIVE_TINT_BY_INSTANCE_COLOR)) {
    return;
  }

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <emissivemap_fragment>",
    `#include <emissivemap_fragment>
#ifdef USE_COLOR
  ${EMISSIVE_TINT_BY_INSTANCE_COLOR}
#endif`
  );
};
