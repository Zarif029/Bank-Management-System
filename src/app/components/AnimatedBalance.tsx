import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

interface AnimatedBalanceProps {
  value: number;
}

export function AnimatedBalance({ value }: AnimatedBalanceProps) {
  const spring = useSpring(value, { stiffness: 80, damping: 22, mass: 0.8 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString('en-IN')
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className="tabular-nums">
      {display}
    </motion.span>
  );
}
