import React from 'react';
import type { Beach } from '@/src/types';
export function MapPreview({ beach }: { beach: Beach }) { return React.createElement('iframe' as any, { title: `Mapa satélite de ${beach.name}`, src: `https://www.google.com/maps?output=embed&q=${beach.latitude},${beach.longitude}&t=k&z=15`, style: { border: 0, width: '100%', height: '100%', display: 'block' }, loading: 'lazy' }); }
