const StarRating = ({ rating, onRate, readonly = false, size = 'md' }) => {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          disabled={readonly}
          onClick={() => !readonly && onRate && onRate(star)}
          className={`${sizes[size]} transition-transform ${!readonly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
        >
          <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
};

export default StarRating;