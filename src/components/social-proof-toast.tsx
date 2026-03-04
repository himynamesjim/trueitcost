'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, Calculator, Users, X } from 'lucide-react';

interface Toast {
  id: string;
  name: string;
  action: string;
  icon: 'check' | 'trending' | 'calculator' | 'users';
  isExiting: boolean;
}

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Jamie', 'Cameron', 'Skyler', 'Rowan', 'Sage', 'River', 'Dakota', 'Phoenix',
  'Charlie', 'Blake', 'Drew', 'Reese', 'Emerson', 'Finley', 'Hayden', 'Parker'
];

const lastInitials = [
  'A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'J.', 'K.',
  'L.', 'M.', 'N.', 'P.', 'R.', 'S.', 'T.', 'W.', 'Y.', 'Z.'
];

const actions = [
  { text: 'just completed a Co-Term calculation', icon: 'calculator' as const },
  { text: 'just created a UCaaS design', icon: 'check' as const },
  { text: 'just completed a network assessment', icon: 'trending' as const },
  { text: 'just designed a collaboration solution', icon: 'users' as const },
  { text: 'just created a security design', icon: 'check' as const },
  { text: 'just completed a datacenter assessment', icon: 'trending' as const },
  { text: 'just designed a BCDR solution', icon: 'check' as const },
  { text: 'just calculated their Co-Term savings', icon: 'calculator' as const },
];

const getRandomName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)];
  return `${firstName} ${lastInitial}`;
};

const getRandomAction = () => {
  return actions[Math.floor(Math.random() * actions.length)];
};

export function SocialProofToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Show first toast after 3 seconds
    const firstToastTimeout = setTimeout(() => {
      showNewToast();
    }, 3000);

    // Then show a new toast every 10-20 seconds
    const interval = setInterval(() => {
      showNewToast();
    }, Math.random() * 10000 + 10000); // Random between 10-20 seconds

    return () => {
      clearTimeout(firstToastTimeout);
      clearInterval(interval);
    };
  }, []);

  const showNewToast = () => {
    const action = getRandomAction();
    const newToast: Toast = {
      id: Date.now().toString(),
      name: getRandomName(),
      action: action.text,
      icon: action.icon,
      isExiting: false,
    };

    setToasts(prev => [...prev, newToast]);

    // Start exit animation after 4.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.map(t =>
        t.id === newToast.id ? { ...t, isExiting: true } : t
      ));
    }, 4500);

    // Remove toast after exit animation completes (5 seconds total)
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    // Trigger exit animation first
    setToasts(prev => prev.map(t =>
      t.id === id ? { ...t, isExiting: true } : t
    ));

    // Remove after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 500);
  };

  const getIcon = (iconType: Toast['icon']) => {
    switch (iconType) {
      case 'check':
        return <CheckCircle className="w-7 h-7 text-emerald-500" />;
      case 'trending':
        return <TrendingUp className="w-7 h-7 text-blue-500" />;
      case 'calculator':
        return <Calculator className="w-7 h-7 text-purple-500" />;
      case 'users':
        return <Users className="w-7 h-7 text-orange-500" />;
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 space-y-3 max-w-md">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 transition-all duration-500 ${
            toast.isExiting ? 'animate-slide-out-left' : 'animate-slide-in-left'
          }`}
          style={{
            marginBottom: index > 0 ? '12px' : '0',
          }}
        >
          <div className="flex-shrink-0 p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
            {getIcon(toast.icon)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {toast.name}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {toast.action}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}

      <style jsx global>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-120%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-120%);
          }
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-slide-out-left {
          animation: slideOutLeft 0.5s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
        }
      `}</style>
    </div>
  );
}
