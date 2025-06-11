import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
export const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

export const slideIn = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
};

export const scaleIn = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
};

// Animation components
export const AnimatedSidePanel = ({ children, isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.aside
                initial="initial"
                animate="animate"
                exit="exit"
                variants={slideIn}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="side-panel"
            >
                {children}
            </motion.aside>
        )}
    </AnimatePresence>
);

export const AnimatedPlanetCard = ({ children, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.05, x: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="planet-card"
    >
        {children}
    </motion.div>
);

export const AnimatedInfoCard = ({ children, isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeIn}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="info-card"
            >
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);

export const AnimatedControlButton = ({ children, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="control-btn"
    >
        {children}
    </motion.button>
);

// Animation hooks
export const usePlanetAnimation = (planetName) => {
    const variants = {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 }
    };

    return {
        variants,
        transition: {
            duration: 0.5,
            ease: "easeInOut"
        }
    };
};

export const useOrbitAnimation = (speed) => {
    return {
        animate: {
            rotate: 360,
            transition: {
                duration: speed,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };
};

// Utility functions
export const getAnimationDelay = (index) => index * 0.1;

export const getStaggerChildren = (staggerAmount = 0.1) => ({
    animate: {
        transition: {
            staggerChildren: staggerAmount
        }
    }
}); 