import React from 'react';
import {
  ChatBubbleLeftIcon,
  BookOpenIcon,
  PaperAirplaneIcon,
  TrashIcon,
  HeartIcon,
  CheckIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  FireIcon,
  SparklesIcon,
  UserIcon,
  EllipsisVerticalIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export const COLORS = {
  primary: '#FF8C42',      // Tangerine Orange
  secondary: '#FCBF49',    // Sunny Yellow
  accent: '#FCBF49',       // Sunny Yellow
  background: '#FFF9F0',   // Soft Cream
  text: '#2B2D42',         // Dark Slate
  dark: '#2B2D42'          // Dark Slate
};

export const Icons = {
  Chat: () => <ChatBubbleLeftIcon className="w-6 h-6" />,
  Book: () => <BookOpenIcon className="w-6 h-6" />,
  Send: () => <PaperAirplaneIcon className="w-5 h-5" />,
  Trash: () => <TrashIcon className="w-[18px] h-[18px]" />,
  Heart: (props: { filled?: boolean }) => (
    props.filled 
      ? <HeartIconSolid className="w-5 h-5" />
      : <HeartIcon className="w-5 h-5" />
  ),
  Check: () => <CheckIcon className="w-4 h-4" />,
  Timer: () => <ClockIcon className="w-4 h-4" />,
  Chef: () => <FireIcon className="w-4 h-4" />,
  Logout: () => <ArrowRightOnRectangleIcon className="w-5 h-5" />,
  Close: () => <XMarkIcon className="w-6 h-6" />,
  Menu: () => <Bars3Icon className="w-6 h-6" />,
  Search: (props: { className?: string }) => (
    <MagnifyingGlassIcon className={props.className || "w-[18px] h-[18px]"} />
  ),
  ChevronDown: () => <ChevronDownIcon className="w-4 h-4" />,
  Login: () => <ArrowRightOnRectangleIcon className="w-[18px] h-[18px]" />,
  Logo: (props: { className?: string }) => <SparklesIcon className={props.className || "w-6 h-6"} />,
  User: (props: { className?: string }) => <UserIcon className={props.className || "w-6 h-6"} />,
  MoreVertical: () => <EllipsisVerticalIcon className="w-5 h-5" />,
  Calendar: () => <CalendarDaysIcon className="w-6 h-6" />
};
