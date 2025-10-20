// import { motion } from "framer-motion";

// const PageWrapper = ({ children }) => {
//   //כניסה רכה בכל העמודים
//   return (
//     <motion.div
//       initial={{ opacity: 0.6, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0.6, y: -10 }}
//       transition={{ duration: 0.6, ease: "easeInOut" }}
//     >
//       {children}
//     </motion.div>
//   );
// };

// export default PageWrapper;
import { motion } from "framer-motion";

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0.6, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0.6, y: -10 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ position: "relative" }} // חשוב ל-stable DOM
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
