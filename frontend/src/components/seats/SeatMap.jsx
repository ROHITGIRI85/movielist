export default function SeatMap({ seats, selected, onToggle }) {
  return <div><div className="screen-marker" aria-hidden="true">SCREEN</div><div className="seat-map" role="group" aria-label="Choose seats">
    {seats.map((seat) => {
      const isSelected = selected.includes(seat.seatId);
      const unavailable = seat.status !== 'available';
      return <button key={seat._id} type="button" className={`seat seat-${seat.status} ${isSelected ? 'seat-selected' : ''}`} disabled={unavailable} aria-pressed={isSelected} aria-label={`${seat.label}, ${seat.category}, ${seat.status}`} onClick={() => onToggle(seat.seatId)}><span>{seat.label}</span><small>{seat.status}</small></button>;
    })}
  </div><div className="seat-legend"><span>□ Available</span><span>▣ Selected</span><span>■ Held/booked</span></div></div>;
}
