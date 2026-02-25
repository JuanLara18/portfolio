import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useInView, useTransform } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { variants as motionVariants, useScrollRevealVariants, easeGentle } from '../../../utils';

// Create a context to manage transition state
const TransitionContext = createContext();

// Enhanced page transitions with professional feel
const pageTransitions = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: easeGentle,
      staggerChildren: 0.05
    } 
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { 
      duration: 0.3, 
      ease: easeGentle 
    } 
  }
};

export const TransitionProvider = ({ children }) => {
	const location = useLocation();
	const [deviceInfo, setDeviceInfo] = useState({
		isMobile: false,
		prefersReducedMotion: false,
		isHighPerformance: true
	});
	const fpsCounter = useRef({ frames: 0, lastTime: performance.now() });
	const [avgFps, setAvgFps] = useState(60);

	useEffect(() => {
		const checkDevice = () => {
			const isMobile = window.innerWidth < 768 || 
											 /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const isHighPerformance = !isMobile && !prefersReducedMotion && 
															 !(navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
			setDeviceInfo({ isMobile, prefersReducedMotion, isHighPerformance });
		};
		checkDevice();

		const monitorPerformance = () => {
			fpsCounter.current.frames++;
			const now = performance.now();
			if (now - fpsCounter.current.lastTime > 1000) {
				const fps = Math.round(fpsCounter.current.frames * 1000 / (now - fpsCounter.current.lastTime));
				setAvgFps(prevFps => Math.round((prevFps + fps) / 2));
				if (fps < 30 && deviceInfo.isHighPerformance) {
					setDeviceInfo(prev => ({ ...prev, isHighPerformance: false }));
				}
				fpsCounter.current = { frames: 0, lastTime: now };
			}
			requestAnimationFrame(monitorPerformance);
		};
		if (!deviceInfo.prefersReducedMotion) {
			requestAnimationFrame(monitorPerformance);
		}
		const handleResize = () => checkDevice();
		window.addEventListener('resize', handleResize);
		window.addEventListener('orientationchange', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('orientationchange', handleResize);
		};
	}, []);

	return (
		<TransitionContext.Provider value={{ ...deviceInfo, avgFps }}>
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={location.pathname}
					initial="initial"
					animate="animate"
					exit="exit"
					variants={pageTransitions}
				>
					{children}
				</motion.div>
			</AnimatePresence>
		</TransitionContext.Provider>
	);
};

export const useTransition = () => useContext(TransitionContext);

export const ScrollReveal = ({ 
	children,
	threshold = 0.1,
	direction = "up",
	distance = 30,
	delay = 0,
	duration = 0.7,
	once = true,
	className = "",
	...props 
}) => {
	const { isMobile, prefersReducedMotion, isHighPerformance } = useTransition();
	const ref = useRef(null);
	const isInView = useInView(ref, { once, margin: `-${threshold * 100}px 0px` });
	const adjustedDistance = isMobile ? Math.min(distance, 20) : distance;
	const adjustedDuration = isMobile ? Math.min(duration, 0.5) : duration;
	const adjustedDelay = isMobile ? delay * 0.5 : delay;
	const shouldUseSimpleAnimation = prefersReducedMotion || !isHighPerformance;
	const variants = useScrollRevealVariants({
		direction,
		distance: adjustedDistance,
		duration: adjustedDuration,
		delay: adjustedDelay,
		simple: shouldUseSimpleAnimation
	});
	return (
		<motion.div
			ref={ref}
			className={className}
			variants={variants}
			initial="hidden"
			animate={isInView ? 'visible' : 'hidden'}
			{...props}
		>
			{children}
		</motion.div>
	);
};

export const ParallaxScroll = ({ children, speed = 0.2, className = "", ...props }) => {
	const { isMobile, prefersReducedMotion, isHighPerformance } = useTransition();
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
	if (prefersReducedMotion || !isHighPerformance) {
		return <div ref={ref} className={className} {...props}>{children}</div>;
	}
	const adjustedSpeed = isMobile ? speed * 0.5 : speed;
	const y = useSpring(
		useTransform(scrollYProgress, [0, 1], [0, adjustedSpeed * 100]),
		{ stiffness: 100, damping: 30, restDelta: 0.001 }
	);
	return (
		<motion.div ref={ref} style={{ y }} className={className} {...props}>
			{children}
		</motion.div>
	);
};

export const StaggerContainer = ({ 
	children, 
	staggerDelay = 0.1, 
	childVariants,
	className = "", 
	...props 
}) => {
	const { isMobile, prefersReducedMotion } = useTransition();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, amount: 0.2 });
	const defaultVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
	};
	const variants = childVariants || defaultVariants;
	const adjustedDelay = prefersReducedMotion ? 0 : (isMobile ? staggerDelay * 0.5 : staggerDelay);
	return (
		<motion.div
			ref={ref}
			className={className}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
			variants={{ hidden: {}, visible: { transition: { staggerChildren: adjustedDelay, delayChildren: 0.1 } } }}
			{...props}
		>
			{React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child, { variants: child.props.variants || variants }) : child)}
		</motion.div>
	);
};

export const HoverMotion = ({ 
	as: Component = motion.div,
	children, 
	scale = 1.02, 
	y = -2, 
	duration = 0.3,
	className = "", 
	extraWhileHover = {},
	...props 
}) => {
	const { isMobile, prefersReducedMotion } = useTransition();
	if (isMobile || prefersReducedMotion) {
		return <Component className={className} {...props}>{children}</Component>;
	}
	return (
		<Component
			className={className}
			whileHover={{ scale, y, transition: { duration: Math.min(duration, 0.2), ease: [0.22, 1, 0.36, 1] }, ...extraWhileHover }}
			{...props}
		>
			{children}
		</Component>
	);
};

export default TransitionProvider;
