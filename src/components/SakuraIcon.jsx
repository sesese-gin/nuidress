
const SakuraIcon = ({ size = 20, className = "" }) => (
  <img 
    src="/sakura.png" 
    alt="sakura" 
    style={{ width: size, height: size }} 
    className={`inline-block align-text-bottom ${className}`}
  />
);

export default SakuraIcon;
