import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

/** =========================================================
 * 1) ÁRBOL ORIGINAL (PUEDES PEGAR AQUÍ TU ARBOL COMPLETO)
 *    Si quieres, primero prueba con el TEST_MINIMO y luego
 *    cambia RAW_TREE_NODES por tu árbol real.
 * ========================================================= */

// --- TEST MÍNIMO (debe funcionar sí o sí)
const TEST_MINIMO = {
  startId: 't0',
  nodes: {
    t0: {
      id: 't0',
      title: 'Test salto a final1',
      options: [
        { label: 'Ir a final1', nextId: 'final1' },
        { label: 'Ir a no_candidato', nextId: 'no_candidato' },
      ],
    },
    final1: { id: 'final1', title: 'Reperfusión', result: 'OK final1' },
    no_candidato: { id: 'no_candidato', title: 'No candidato', result: 'OK no candidato' },
  },
};

// --- Pega aquí TUS NODOS (reemplaza este ejemplo por el tuyo si quieres probar directo)
const RAW_TREE_NODES = {
  inicio: {
    id: 'inicio',
    title: 'Estado de grandes vasos',
    body: 'En pacientes con inicio de síntomas < 24 h',
    options: [
      { label: 'Oclusión vaso proximal', nextId: 'tiempo desde inicio de síntomas' },
      { label: 'Oclusión basilar', nextId: 'tiempo desde inicio de síntomas2' },
      { label: 'No hay oclusión de gran vaso', nextId: 'tiempo desde inicio de síntomas3' },
    ],
  },

  'tiempo desde inicio de síntomas': {
    id: 'tiempo desde inicio de síntomas',
    title: 'Oclusión vaso proximal',
    body: 'Oclusión vaso proximal',
    options: [
      { label: 'Wake up o inicio incierto', nextId: 'perfusión' },
      { label: 'Síntomas < 6 horas', nextId: 'NIHS6' },                    // placeholder
      { label: 'Entre 6-24 h, Rankin 3 o menor', nextId: 'perfusión' }, // placeholder
    ],
  },

  'perfusión': {
    id: 'perfusión',
    title: 'Perfusión',
    body:
      'Perfusión (+): CBF <30%, mismatch absoluto >10 ml (IVT) / >15 ml (EVT); mismatch relativo >1,2 (IVT) / >1,8 (EVT).',
    options: [
      { label: '(+)', nextId: 'final1' }, // placeholder
      { label: '(-)', nextId: 'No es candidato a reperfusión' },
    ],
  },

  'tiempo desde inicio de síntomas2': {
    id: 'tiempo desde inicio de síntomas2',
    title: 'Tiempo desde inicio de síntomas',
    body: 'ACV del despertar o menos de 24 h',
    options: [
      { label: 'Sí', nextId: 'NIHS2' },
      { label: 'No', nextId: 'No es candidato a reperfusión' },
    ],
  },

'NIHS2': {
    id: 'NIHS2',
    title: 'Calcular NIHS',
    body:
      '',
    options: [
      { label: 'NIH <6', nextId: 'tromb1' }, // placeholder
      { label: 'NIH 6-9', nextId: 'tromb2' },
      { label: 'NIH >10', nextId: 'tromb3' },
    ],
  },

  'No es candidato a reperfusión': {
    id: 'No es candidato a reperfusión',
    title: 'No es candidato a reperfusión',
    result: 'No es candidato a reperfusión',
  },

  'final1': {
    id: 'final1',
    title: 'Reperfusión',
    result:
      'Trombectomía mecánica si ASPECTS > 3. Trombólisis EV además si síntomas > 9 h (según criterios locales).',
  },

    'tromb1': {
    id: 'tromb1',
    title: 'Reperfusión',
     result:
      'Trombolisis EV (si <5h) + trombectomia si sintomas fluctuantes o deterioro temprano',
  },
      'tromb2': {
    id: 'tromb2',
    title: 'Reperfusión',
    result:
      'Trombolisis EV (si <5h) + trombectomía si déficit invalidante o mala colateralidad pC_SC <6' ,
  },
      'tromb3': {
    id: 'tromb3',
    title: 'Reperfusión',
    result:
      'Trombolisis EV (si <5h) + trombecotmia mecánica',
  },

  'NIHS6': {
    id: 'NIHS6',
    title: 'Valor NIH',
    body: '',
    options: [
      { label: 'NIHS 6 o mas', nextId: 'NIHS6_1' },
      { label: 'NIHS < 6', nextId: 'NIHS6_2' },                    
    ],
  },

    'NIHS6_1': {
    id: 'NIHS6_1',
    title: 'NIHS 6 o más',
    result:
      'Trombolisis EV (si <5h) + trombecotmia mecánica(ASPECT >3)',
  },

    'NIHS6_2': {
    id: 'NIHS6_2',
    title: 'NIH < 6 horas',
    result:
      'Trombolisis EV (si <5h) + trombecotmia mecánicaTrombolisis EV (si <5hrs) + trombectomia mecanica si sintoma fluctuante o deficit invalidante',
  },

  'tiempo desde inicio de síntomas3': {
    id: 'tiempo desde inicio de síntomas3',
    title: 'Tiempo de inicio de los síntomas',
    options: [
      { label: 'Síntomas < 6 h', nextId: 'tromb4' },    // placeholder
      { label: 'Síntomas > 6 h', nextId: 'tromb5' },    // placeholder
      { label: 'ACV del despertar o inicio incierto menor a 24h', nextId: 'tromb6' }, // placeholder
    ],
  },

  'tromb4': {
    id: 'tromb4',
    title: 'Reperfusión',
    result: 'Trombolisis EV ',
    },



  'tromb5': {
    id: 'tromb5',
    title: 'Tiempo de inicio de los síntomas',
    options: [
      { label: 'Síntomas < 9 h', nextId: 'perfusion2' },    // placeholder
      { label: 'Síntomas > 9 h', nextId: 'No es candidato a reperfusión' },    // placeholder
      
    ],
  },

  'tromb6': {
    id: 'tromb6',
    title: 'Tiempo de inicio de los síntomas',
    options: [
      { label: 'Síntomas < 9 h', nextId: 'nihs4' },    // placeholder
      { label: 'Síntomas > 9 h', nextId: 'FLAIR' },    // placeholder
      
    ],
  },

  'nihs4': {
    id: 'nihs4',
    title: 'calcular NIHS',
    options: [
      { label: 'NIHS <= 4', nextId: 'FLAIR' },    // placeholder
      { label: 'NIHS > 4', nextId: 'perfusion2' },    // placeholder
      
    ],
  },

  'FLAIR': {
    id: 'FLAIR',
    title: 'RM FLAIR',
    options: [
      { label: 'FLAIR muestra infarto', nextId: 'No es candidato a reperfusión' },    // placeholder
      { label: 'FLAIR no muestra infarto', nextId: 'tromb4' },    // placeholder
      
    ],
  },

  'perfusión2': {
    id: 'perfusión2',
    title: 'Perfusión',
    body:
      'Perfusión (+): CBF <30%, mismatch absoluto >10 ml (IVT) / >15 ml (EVT); mismatch relativo >1,2 (IVT) / >1,8 (EVT).',
    options: [
      { label: '(+)', nextId: 'tromb4' }, // placeholder
      { label: '(-)', nextId: 'No es candidato a reperfusión' },
    ],
  },

  // PLACEHOLDERS para evitar pantallas en blanco
  lkw: {
    id: 'lkw',
    title: 'LKW / Ventana',
    result: 'Nodo temporal (placeholder): define aquí el flujo real para ventana / LKW.',
  },
  'no-deficit': {
    id: 'no-deficit',
    title: 'Sin déficit focal claro',
    result: 'Nodo temporal (placeholder): completa esta rama o redirígela donde corresponda.',
  },
};

// Usa este para probar TODO reducido: const RAW_TREE = TEST_MINIMO;
const RAW_TREE = { startId: 'inicio', nodes: RAW_TREE_NODES };

/** =========================================================
 * 2) NORMALIZADOR DE IDs
 *    Convierte claves/ids/nextIds a slugs seguros (sin tildes, sin espacios)
 *    y muestra una tabla de mapeo por consola para depurar.
 * ========================================================= */

const slugify = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

function normalizeTree(rawTree) {
  const map = {}; // claveOriginal -> slug
  const nodes = rawTree.nodes || {};
  // 1) crear slugs para cada clave
  Object.keys(nodes).forEach((k) => {
    const slug = slugify(k);
    // si chocan slugs, añade sufijo incremental
    let final = slug;
    let i = 2;
    while (map && Object.values(map).includes(final)) {
      final = `${slug}_${i++}`;
    }
    map[k] = final;
  });

  // 2) reconstruir nodes con claves slug y ajustar node.id y options.nextId
  const newNodes = {};
  for (const [origKey, node] of Object.entries(nodes)) {
    const newKey = map[origKey];
    const cloned = { ...node };
    // id interno → slug coherente con la clave
    cloned.id = newKey;
    if (cloned.options) {
      cloned.options = cloned.options.map((opt) => ({
        ...opt,
        nextId: map[opt.nextId] || slugify(opt.nextId), // re-enrutar si el target existe; si no, slugifica
      }));
    }
    newNodes[newKey] = cloned;
  }

  // 3) startId slugificado
  const startIdSlug = map[rawTree.startId] || slugify(rawTree.startId);

  // 4) log de mapeo
  console.table(
    Object.entries(map).map(([from, to]) => ({ original: from, slug: to }))
  );

  return { startId: startIdSlug, nodes: newNodes, _map: map };
}

const STROKE_TREE = normalizeTree(RAW_TREE);

/** =========================================================
 * 3) VALIDADORES Y ERROR BOUNDARY
 * ========================================================= */

function validateTree(tree) {
  const ids = new Set(Object.keys(tree.nodes));
  const errors = [];
  const referenced = new Set([tree.startId]);

  if (!ids.has(tree.startId)) errors.push(`startId "${tree.startId}" no existe en nodes`);

  for (const [key, node] of Object.entries(tree.nodes)) {
    if (node.id && node.id !== key) errors.push(`Nodo "${key}" tiene id interno distinto: "${node.id}"`);
    if (node.options && node.result) errors.push(`Nodo "${key}" no debe tener "options" y "result" a la vez`);
    if (node.options) {
      node.options.forEach((opt, i) => {
        if (!ids.has(opt.nextId)) {
          errors.push(`Nodo "${key}" opción #${i + 1} apunta a nextId inexistente: "${opt.nextId}"`);
        } else {
          referenced.add(opt.nextId);
        }
      });
    }
  }

  const orphan = [...ids].filter((id) => !referenced.has(id));
  return { errors, orphan };
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    console.error('[ErrorBoundary]', err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <SafeAreaView style={[styles.safe, { padding: 16 }]}>
          <Text style={styles.cardTitle}>Se produjo un error</Text>
          <Text style={styles.cardBody}>{String(this.state.err?.message || this.state.err)}</Text>
          <View style={{ height: 12 }} />
          <Text style={styles.cardBody}>Revisa la consola (F12 en web) para el stack.</Text>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

/** =========================================================
 * 4) APP
 * ========================================================= */

export default function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [currentId, setCurrentId] = useState(STROKE_TREE.startId);
  const [history, setHistory] = useState([]);

  // Valida el árbol al iniciar
  useEffect(() => {
    const rep = validateTree(STROKE_TREE);
    console.log('[TREE CHECK]', rep);
    if (rep.errors.length) {
      const msg = 'Errores en árbol:\n' + rep.errors.join('\n');
      if (Platform.OS === 'web') console.error(msg);
      Alert.alert('Errores en árbol', msg);
    }
    // También log de start/node actual
    console.log('[START]', { startId: STROKE_TREE.startId, currentId });
  }, []);

  const node = useMemo(() => STROKE_TREE.nodes[currentId], [currentId]);
  const isResult = !!node?.result;

  // Guard de navegación
  const handleSelect = (opt) => {
    const target = STROKE_TREE.nodes[opt.nextId];
    console.log('[DEBUG next]', {
      from: currentId,
      choice: opt.label,
      nextId: opt.nextId,
      exists: !!target,
    });
    if (!target) {
      const msg = `No existe el nodo con id/clave: ${opt.nextId}`;
      if (Platform.OS === 'web') console.error(msg);
      Alert.alert('Árbol incompleto', msg);
      return;
    }
    setHistory((h) => [...h, { id: currentId, choiceLabel: opt.label }]);
    setCurrentId(opt.nextId);
  };

  const goBack = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      const newHist = h.slice(0, -1);
      setCurrentId(prev.id);
      return newHist;
    });
  };

  const restart = () => {
    setCurrentId(STROKE_TREE.startId);
    setHistory([]);
  };

  const makeSummary = () => {
    const steps = history
      .map((h, idx) => `${idx + 1}. ${STROKE_TREE.nodes[h.id]?.title}\n   → Opción: ${h.choiceLabel}`)
      .join('\n');
    const last = isResult ? `\n\nConclusión: ${node.title}\n${node.result}` : '';
    return `Árbol ACV — Resumen de recorrido\n\n${steps}${last}`;
  };

  const shareSummary = () => {
    const txt = makeSummary();
    Alert.alert('Resumen', txt);
  };

  // Guard de render
  if (!node) {
    const msg = `currentId = ${String(currentId)} no existe en el árbol.`;
    if (Platform.OS === 'web') console.error(msg);
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="auto" />
        <View style={styles.container}>
          <Text style={styles.cardTitle}>Nodo no encontrado</Text>
          <Text style={styles.cardBody}>{msg}</Text>
          <View style={{ height: 12 }} />
          <HeaderButton label="Reiniciar" onPress={restart} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Árbol de decisiones reperfusión</Text>
        <View style={styles.headerBtns}>
          <HeaderButton label="Reiniciar" onPress={restart} />
          <HeaderButton label="Atrás" onPress={goBack} disabled={history.length === 0} />
          <HeaderButton label="Resumen" onPress={shareSummary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.cardTitle}>{node.title}</Text>
        {node.body ? <Text style={styles.cardBody}>{node.body}</Text> : null}

        {!isResult ? (
          <View style={styles.optionsWrap}>
            {node.options?.map((opt) => (
              <OptionButton key={opt.label} label={opt.label} onPress={() => handleSelect(opt)} />
            ))}
          </View>
        ) : (
          <View style={styles.resultWrap}>
            <Text style={styles.resultTitle}>Resultado</Text>
            <Text style={styles.resultText}>{node.result}</Text>
          </View>
        )}

        {history.length > 0 && (
          <View style={styles.historyWrap}>
            <Text style={styles.historyTitle}>Recorrido</Text>
            {history.map((h, i) => (
              <Text key={i} style={styles.historyItem}>
                {i + 1}. {STROKE_TREE.nodes[h.id]?.title}{'\n'}   → {h.choiceLabel}
              </Text>
            ))}
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function HeaderButton({ label, onPress, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.hBtn, disabled && styles.hBtnDisabled]}>
      <Text style={[styles.hBtnText, disabled && styles.hBtnTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

function OptionButton({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.optBtn}>
      <Text style={styles.optBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b132b' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#1c2541',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  headerBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  hBtn: { backgroundColor: '#3a506b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  hBtnDisabled: { opacity: 0.5 },
  hBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  hBtnTextDisabled: { color: 'rgba(255,255,255,0.6)' },

  container: { padding: 16 },
  cardTitle: { fontSize: 22, color: 'white', fontWeight: '800', marginBottom: 8 },
  cardBody: { fontSize: 16, color: 'rgba(255,255,255,0.9)', lineHeight: 22 },

  optionsWrap: { marginTop: 16, gap: 12 },
  optBtn: { backgroundColor: '#5bc0be', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  optBtnText: { color: '#062925', fontSize: 16, fontWeight: '800', textAlign: 'center' },

  resultWrap: {
    marginTop: 16,
    backgroundColor: '#1b3a4b',
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  resultTitle: { color: '#e0fbfc', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  resultText: { color: '#e0fbfc', fontSize: 15, lineHeight: 22 },

  historyWrap: { marginTop: 24, backgroundColor: '#0f2a3a', padding: 12, borderRadius: 10 },
  historyTitle: { color: '#98c1d9', fontWeight: '800', marginBottom: 8 },
  historyItem: { color: '#cde7f0', marginBottom: 6 },
});
