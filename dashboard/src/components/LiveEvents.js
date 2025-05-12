import { useEffect, useState } from "react";

export default function LiveEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const es = new EventSource("/events");
    es.onmessage = e => {
      const data = JSON.parse(e.data);
      setEvents(ev => [data, ...ev].slice(0, 50));
    };
    return () => es.close();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Live On-Chain Events</h2>
      <ul className="list-disc list-inside max-h-64 overflow-y-auto">
        {events.map((ev, i) => (
          <li key={i}>
            <code>{JSON.stringify(ev)}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
