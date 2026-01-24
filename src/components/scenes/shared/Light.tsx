export const Light = () => {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.3} />
    </>
  );
};
