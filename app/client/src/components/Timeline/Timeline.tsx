// src/components/BuildItineraryVisualization/Timeline.tsx
import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ItinerariesContext } from '../../context/ItinerariesContext';
import { BagItem } from '../SearchLayout/SearchLayout';

export interface TimelineEvent extends BagItem {
  eventId: number;
  utcDate: string;    // "YYYY-MM-DD"
  startTime: string;  // "hh:mm AM/PM"
  endTime: string;    // "hh:mm AM/PM"
}

function toSqlTime(t12: string) {
  const [hm, ampm] = t12.split(' ');
  let [h, m] = hm.split(':').map(x => parseInt(x,10));
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const pad2 = (n: number) => n.toString().padStart(2,'0');
  return `${pad2(h)}:${pad2(m)}:00`;
}

export default function Timeline() {
  const { id } = useParams<{ id: string }>();
  const itineraryId = Number(id);
  const navigate = useNavigate();
  const { list } = useContext(ItinerariesContext);
  const itin = list.find(i => i.id === itineraryId);
  const bag: BagItem[] = itin?.bag ?? [];

  // build days between start/end
  const days = useMemo(() => {
    if (!itin) return [];
    const out: string[] = [];
    const cur = new Date(itin.startDate);
    const last = new Date(itin.endDate);
    while (cur <= last) {
      out.push(cur.toISOString().slice(0,10));
      cur.setDate(cur.getDate()+1);
    }
    return out;
  }, [itin]);

  // helpers
  const pad2 = (n: number) => String(n).padStart(2,'0');
  const to12h = (hh24: string, mm: string) => {
    let h = parseInt(hh24,10);
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${pad2(h)}:${pad2(parseInt(mm,10))} ${ap}`;
  };
  const parseTime = (h:string,m:string,ap:'AM'|'PM') => {
    let hh = parseInt(h,10)%12;
    if (ap==='PM') hh+=12;
    return hh*60+parseInt(m,10);
  };

  // schedule state w/ localStorage key
  const storageKey = `itinerary-${itineraryId}-schedule`;
  const buildEmpty = (): Record<string,TimelineEvent[]> => {
    const m: Record<string,TimelineEvent[]> = {};
    days.forEach(d=>m[d]=[]);
    return m;
  };
  const [schedule, setSchedule] = useState<Record<string,TimelineEvent[]>>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : buildEmpty();
  });
  const [loading, setLoading] = useState(true);

  // sync to localStorage on any schedule change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(schedule));
  }, [schedule, storageKey]);

  // load from DB on first mount (only if localStorage was empty)
  const loadDb = useCallback(() => {
    if (!itineraryId) return;
    setLoading(true);
    fetch(`/api/itineraries/${itineraryId}/events`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(data => {
        const m = buildEmpty();
        (data.events as any[]).forEach(raw => {
          const date = raw.event_date.slice(0,10);
          const [sh,sm] = raw.start_time.split(':');
          const [eh,em] = raw.end_time.split(':');
          const ev: TimelineEvent = {
            eventId: raw.eventId,
            id: raw.place_id,
            name: raw.name,
            type: raw.type,
            utcDate: date,
            startTime: to12h(sh,sm),
            endTime:   to12h(eh,em),
          };
          if (m[date]) m[date].push(ev);
        });
        // sort
        days.forEach(d => {
          m[d].sort((a,b) => {
            const [ha,ma,apa] = a.startTime.split(/[: ]/) as [string,string,'AM'|'PM'];
            const [hb,mb,apb] = b.startTime.split(/[: ]/) as [string,string,'AM'|'PM'];
            return parseTime(ha,ma,apa)-parseTime(hb,mb,apb);
          });
        });
        setSchedule(m);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [itineraryId, days]);

  // only load from DB if nothing in localStorage
  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      loadDb();
    } else {
      setLoading(false);
    }
  }, [loadDb, storageKey]);

  // day nav
  const [dayIndex, setDayIndex] = useState(0);
  const currentDay = days[dayIndex] || '';

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<BagItem|null>(null);
  const [customText, setCustomText] = useState('');
  const [startHour, setStartHour]     = useState('12');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmPm, setStartAmPm]     = useState<'AM'|'PM'>('AM');
  const [endHour, setEndHour]         = useState('12');
  const [endMinute, setEndMinute]     = useState('00');
  const [endAmPm, setEndAmPm]         = useState<'AM'|'PM'>('AM');

  const openModalFor = (item: BagItem) => {
    setPendingEvent(item);
    setStartHour('12'); setStartMinute('00'); setStartAmPm('AM');
    setEndHour('12');   setEndMinute('00');   setEndAmPm('AM');
    setIsModalOpen(true);
  };

  // drag/drop
  const onDragStart = (e:React.DragEvent, item:BagItem) =>
    e.dataTransfer.setData('application/json',JSON.stringify(item));
  const onDragOver = (e:React.DragEvent) => e.preventDefault();
  const onDrop = (e:React.DragEvent) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('application/json')) as BagItem;
    openModalFor(item);
  };

  // custom add
  const addCustom = () => {
    if (!customText.trim()) return;
    openModalFor({ id: Date.now(), name: customText, type:'restaurant' });
    setCustomText('');
  };

  const handleConfirm = () => {
    if (!pendingEvent) return;
    const s12 = `${startHour.padStart(2,'0')}:${startMinute.padStart(2,'0')} ${startAmPm}`;
    const e12 = `${endHour.padStart(2,'0')}:${endMinute.padStart(2,'0')} ${endAmPm}`;
    const dayEvts = schedule[currentDay]||[];
    if (dayEvts.some(ev=>ev.startTime===s12||ev.endTime===e12)) {
      return alert('Time conflict');
    }

    const newEv:TimelineEvent = {
      ...pendingEvent,
      eventId: 0,
      utcDate: currentDay,
      startTime: s12,
      endTime: e12,
    };
    const s24 = toSqlTime(s12), e24 = toSqlTime(e12);
    const endpoint = pendingEvent.type==='attraction'
      ? '/api/attraction-events'
      : '/api/restaurant-events';
    const payload:any = {
      itineraryId,
      startTime: `${currentDay} ${s24}`,
      endTime:   `${currentDay} ${e24}`,
      categories: pendingEvent.categories||''
    };
    if (pendingEvent.type==='attraction') payload.attractionId = pendingEvent.id;
    else payload.businessId = pendingEvent.id;

    fetch(`http://localhost:3001${endpoint}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    })
    .then(r=>{ if(!r.ok) throw new Error(r.statusText); return r.json(); })
    .then(() => {
      // local update + persisted by our useEffect
      const updated = [...dayEvts, newEv].sort((a,b)=>{
        const [ha,ma,apa] = a.startTime.split(/[: ]/ ) as [string,string,'AM'|'PM'];
        const [hb,mb,apb] = b.startTime.split(/[: ]/ ) as [string,string,'AM'|'PM'];
        return parseTime(ha,ma,apa)-parseTime(hb,mb,apb);
      });
      setSchedule(m=>({ ...m, [currentDay]: updated }));
      setIsModalOpen(false);
      setPendingEvent(null);
    })
    .catch(err=>{ console.error(err); alert('Save failed'); });
  };


  const handleDelete = (evt:TimelineEvent) => {
    const filtered = (schedule[currentDay]||[]).filter(e=>
      !(e.id===evt.id && e.type===evt.type && e.startTime===evt.startTime)
    );
    setSchedule(m=>({ ...m, [currentDay]: filtered }));
    console.log(evt.eventId);
    const path =
    evt.type === 'attraction'
      ? `/api/attraction-event/${evt.eventId}`
      : `/api/restaurant-event/${evt.eventId}`;

      fetch(`http://localhost:3001${path}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      })
      .catch(err => {
        console.error('Could not delete event', err);
        alert('Failed to delete event.');
      });

  };

  // export ICS
  const exportToCalendar = () => {
    if (!itin) return;
    const now = new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Pathways//EN'];
    Object.entries(schedule).forEach(([date,evts]) =>
      evts.forEach(evt=>{
        const [Y,M,D] = date.split('-');
        const dt = (t:string)=>{
          const [h,m,ap] = t.split(/[: ]/) as [string,string,'AM'|'PM'];
          let hh = parseInt(h,10)%12 + (ap==='PM'?12:0);
          return `${Y}${M}${D}T${pad2(hh)}${pad2(+m)}00`;
        };
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${itin.id}-${evt.id}@pathways`);
        lines.push(`DTSTAMP:${now}`);
        lines.push(`DTSTART:${dt(evt.startTime)}`);
        lines.push(`DTEND:${dt(evt.endTime)}`);
        lines.push(`SUMMARY:${evt.type.toUpperCase()}: ${evt.name}`);
        lines.push('END:VEVENT');
      })
    );
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')],{type:'text/calendar'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download=`${itin.destination||'itinerary'}.ics`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <p>Loading…</p>;
  if (!itin)   return <p>No itinerary found.</p>;

  return (
    <>
      <div className="relative p-4">
        <button className="text-blue-500 mb-4" onClick={()=>navigate(`/itineraries/${id}/plan`)}>
          ← Back
        </button>
        <h1 className="text-3xl font-bold mb-4">{itin.destination}</h1>

        {/* Day nav */}
        <div className="flex justify-center items-center mb-6">
          <button
            onClick={()=>setDayIndex(i=>Math.max(0,i-1))}
            disabled={dayIndex===0}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >←</button>
          <span className="mx-4 text-xl">{currentDay}</span>
          <button
            onClick={()=>setDayIndex(i=>Math.min(days.length-1,i+1))}
            disabled={dayIndex===days.length-1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >→</button>
        </div>

        <div className="flex gap-4">
          {/* Bag */}
          <div className="w-1/4 p-2 border rounded max-h-96 overflow-auto">
            <h2 className="font-semibold mb-2">Bag</h2>
            {bag.map(item=>(
              <div
                key={`bag-${item.type}-${item.id}`}
                draggable
                onDragStart={e=>onDragStart(e,item)}
                className="p-2 mb-1 bg-white rounded shadow cursor-move"
              >
                [{item.type}] {item.name}
              </div>
            ))}
            <div className="mt-4">
              <h3 className="font-semibold">Add Personal</h3>
              <input
                className="w-full p-1 border rounded mb-1"
                placeholder="Custom item"
                value={customText}
                onChange={e=>setCustomText(e.target.value)}
              />
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={addCustom}
              >Add</button>
            </div>
          </div>

          {/* Day drop zone */}
          <div
            className="flex-1 p-4 border rounded min-h-[24rem]"
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <h2 className="font-semibold mb-2">Events for {currentDay}</h2>
            {schedule[currentDay]?.map(evt=>(
              <div
                key={`evt-${evt.type}-${evt.id}-${evt.startTime}`}
                className="flex justify-between items-center p-2 mb-1 bg-gray-100 rounded"
              >
                <span>
                  [{evt.type}] {evt.name} ({evt.startTime} – {evt.endTime})
                </span>
                <button
                  className="text-red-500 font-bold px-2"
                  onClick={()=>handleDelete(evt)}
                >×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Time-entry Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-80">
              <h3 className="text-xl font-semibold mb-4">Set Times</h3>
              <div className="space-y-2">
                {/* Start */}
                <div>
                  <label className="block mb-1">Start Time:</label>
                  <div className="flex space-x-2">
                    <input type="number" min="1" max="12"
                      value={startHour}
                      onChange={e=>setStartHour(e.target.value)}
                      className="w-1/3 p-1 border rounded"
                    />
                    <input type="number" min="0" max="59"
                      value={startMinute}
                      onChange={e=>setStartMinute(e.target.value)}
                      className="w-1/3 p-1 border rounded"
                    />
                    <select
                      value={startAmPm}
                      onChange={e=>setStartAmPm(e.target.value as 'AM'|'PM')}
                      className="w-1/3 p-1 border rounded"
                    >
                      <option>AM</option><option>PM</option>
                    </select>
                  </div>
                </div>
                {/* End */}
                <div>
                  <label className="block mb-1">End Time:</label>
                  <div className="flex space-x-2">
                    <input type="number" min="1" max="12"
                      value={endHour}
                      onChange={e=>setEndHour(e.target.value)}
                      className="w-1/3 p-1 border rounded"
                    />
                    <input type="number" min="0" max="59"
                      value={endMinute}
                      onChange={e=>setEndMinute(e.target.value)}
                      className="w-1/3 p-1 border rounded"
                    />
                    <select
                      value={endAmPm}
                      onChange={e=>setEndAmPm(e.target.value as 'AM'|'PM')}
                      className="w-1/3 p-1 border rounded"
                    >
                      <option>AM</option><option>PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-4 py-1 border rounded"
                  onClick={()=>setIsModalOpen(false)}
                >Cancel</button>
                <button
                  className="px-4 py-1 bg-blue-500 text-white rounded"
                  onClick={handleConfirm}
                >Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export .ics */}
      <button
        className="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={exportToCalendar}
      >
        Export Calendar
      </button>
    </>
  );
}
