const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { marked } = require('marked');

// Configura o Marked para gerar HTML limpo e seguro
marked.setOptions({
  gfm: true,
  breaks: true
});

const DOCS_DB_FILE = path.join(__dirname, '../../local_docs_db.json');
const CHAT_DB_FILE = path.join(__dirname, '../../local_chat_db.json');
const ACTIONS_DB_FILE = path.join(__dirname, '../../local_actions_db.json');
const MEETINGS_DB_FILE = path.join(__dirname, '../../local_meetings_db.json');
const USERS_DB_FILE = path.join(__dirname, '../../local_db.json');

function loadJsonSafe(filePath, defaultVal = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Erro ao carregar ${filePath}:`, e);
  }
  return defaultVal;
}

/**
 * Utilitário para converter UIDs/E-mails em nomes humanos legíveis.
 */
function resolveHumanName(rawId, usersMap = {}) {
  if (!rawId) return 'Não informado';
  if (rawId === 'sistema' || rawId === 'system' || rawId === 'ai') return 'IA Smart Leading';
  if (rawId === 'visaolider' || rawId === 'leader' || rawId === 'me') return 'Líder (Você)';
  if (rawId === 'visaooperacional') return 'Operacional';

  // Se o ID for uma chave direta no banco local_db.json
  if (usersMap[rawId] && usersMap[rawId].name) {
    return usersMap[rawId].name;
  }

  // Busca por e-mail ou uid
  for (const uid in usersMap) {
    const u = usersMap[uid];
    if (u.email === rawId || uid === rawId) {
      return u.name || rawId;
    }
  }

  // Se for um UUID/Hash hexadecimal longo, formata genericamente
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(rawId)) {
    return 'Colaborador';
  }

  return rawId;
}

/**
 * Utilitário para traduzir status técnicos em português amigável.
 */
function formatHumanStatus(statusStr, completed) {
  if (completed === true || statusStr === 'completed') return 'Concluído';
  if (statusStr === 'approved') return 'Aprovado (Ativo)';
  if (statusStr === 'pending_approval') return 'Pendente de Aprovação';
  if (statusStr === 'pending' || completed === false) return 'Pendente';
  if (statusStr === 'Scheduled') return 'Agendada';
  return statusStr || 'Ativo';
}

/**
 * Utilitário para formatar datas ISO em DD/MM/AAAA.
 */
function formatDatePtBr(dateStr) {
  if (!dateStr || dateStr === 'A definir') return 'A definir';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateStr;
  }
}

/**
 * Estilo zebrado para a planilha Excel.
 */
function styleDataRow(row, isEven) {
  row.height = 22;
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF334155' } };
    cell.alignment = { vertical: 'middle' };
    
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isEven ? 'FFF4F6FB' : 'FFFFFFFF' }
    };
    
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  });
}

/**
 * Exporta dados limpos da equipe em Excel (.xlsx).
 */
exports.exportTeamExcel = async (req, res) => {
  try {
    const actionsList = loadJsonSafe(ACTIONS_DB_FILE, []);
    const meetingsList = loadJsonSafe(MEETINGS_DB_FILE, []);
    const docsMap = loadJsonSafe(DOCS_DB_FILE, {});
    const usersMap = loadJsonSafe(USERS_DB_FILE, {});

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório de Equipe');

    worksheet.columns = [
      { header: 'Categoria', key: 'category', width: 22 },
      { header: 'Colaborador / Alvo', key: 'collaborator', width: 25 },
      { header: 'Detalhe / Título', key: 'title', width: 48 },
      { header: 'Status / Data', key: 'status', width: 24 },
      { header: 'Criado / Atribuído Por', key: 'owner', width: 25 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C437E' }
      };
      cell.font = {
        name: 'Segoe UI',
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 11
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF1A2B56' } }
      };
    });

    let rowIndex = 2;

    (Array.isArray(actionsList) ? actionsList : []).forEach(a => {
      const targetName = resolveHumanName(a.ownerId, usersMap);
      const creatorName = resolveHumanName(a.creatorId, usersMap);
      const cleanTitle = (a.title || a.text || '').trim();

      const row = worksheet.addRow({
        category: 'Item de Ação',
        collaborator: targetName,
        title: cleanTitle,
        status: formatHumanStatus(a.status, a.completed),
        owner: creatorName
      });
      styleDataRow(row, rowIndex % 2 === 0);
      rowIndex++;
    });

    Object.keys(docsMap).forEach(key => {
      const list = docsMap[key] || [];
      list.forEach(d => {
        const targetName = resolveHumanName(d.employeeId || d.employeeName || key, usersMap);
        const typeTitle = d.type === 'pdi' ? 'Documento (PDI)' : d.type === 'sbi' ? 'Documento (SBI)' : 'Documento';
        const cleanTitle = (d.title || typeTitle).trim();

        const row = worksheet.addRow({
          category: typeTitle,
          collaborator: targetName,
          title: cleanTitle,
          status: formatHumanStatus(d.status),
          owner: 'Gestor / RH'
        });
        styleDataRow(row, rowIndex % 2 === 0);
        rowIndex++;
      });
    });

    (Array.isArray(meetingsList) ? meetingsList : []).forEach(m => {
      const targetName = resolveHumanName(m.employeeName || m.employeeId, usersMap);
      const cleanTopic = (m.topic || 'Reunião 1:1 de Acompanhamento').trim();

      const row = worksheet.addRow({
        category: 'Reunião 1:1',
        collaborator: targetName,
        title: cleanTopic,
        status: formatHumanStatus(m.status),
        owner: 'Líder (Você)'
      });
      styleDataRow(row, rowIndex % 2 === 0);
      rowIndex++;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-equipe-smart-leading.xlsx"');

    await workbook.xlsx.write(res);
    return res.end();

  } catch (error) {
    console.error('[exportTeamExcel] Erro ao gerar Excel:', error);
    return res.status(500).json({ error: 'Erro ao gerar relatório da equipe em Excel.' });
  }
};

/**
 * Exporta um documento INDIVIDUAL pelo ID em formato HTML/PDF impresso e elegante.
 * Converte automaticamente Markdown em HTML estruturado (com h2, h3, listas, negritos e caixas de destaque).
 * Exibe claramente o Nome do Líder Responsável e do Colaborador.
 */
exports.exportDocumentPdfById = async (req, res) => {
  try {
    const { id } = req.params;
    const docsMap = loadJsonSafe(DOCS_DB_FILE, {});
    const usersMap = loadJsonSafe(USERS_DB_FILE, {});
    let targetDoc = null;

    for (const key in docsMap) {
      const doc = (docsMap[key] || []).find(d => d.id === id);
      if (doc) {
        targetDoc = doc;
        break;
      }
    }

    if (!targetDoc) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    const typeLabel = targetDoc.type === 'pdi' ? 'Plano de Desenvolvimento Individual (PDI)' : targetDoc.type === 'sbi' ? 'Feedback Estruturado (SBI)' : 'Ata de Reunião 1:1';
    
    // Resolução dos nomes de Líder e Colaborador
    const employeeName = resolveHumanName(targetDoc.employeeId || targetDoc.employeeName, usersMap);
    const leaderName = resolveHumanName(targetDoc.leaderId || req.user?.uid || 'visaolider', usersMap);
    
    const safeName = employeeName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${targetDoc.type || 'documento'}_${safeName}.html`;

    // Converte o Markdown do documento em HTML limpo e bem formatado
    const formattedHtmlContent = marked.parse(targetDoc.content || '');

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${targetDoc.title || typeLabel}</title>
  <style>
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      margin: 40px auto;
      max-width: 900px;
      color: #0f172a;
      background-color: #ffffff;
      padding: 0 20px;
    }
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 18px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
      font-weight: 500;
    }
    .badge {
      display: inline-block;
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 24px;
      margin-bottom: 28px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      font-size: 13px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .meta-item strong {
      display: block;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .meta-item span {
      font-weight: 600;
      color: #1e293b;
      font-size: 14px;
    }
    
    /* ESTILIZAÇÃO CORPORATIVA DO CONTEÚDO (CONVERTIDO DE MARKDOWN) */
    .content-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 28px 32px;
      font-size: 14px;
      line-height: 1.7;
      color: #334155;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .content-box h1, .content-box h2, .content-box h3 {
      color: #1e3a8a;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
    }
    .content-box h1:first-child, .content-box h2:first-child, .content-box h3:first-child {
      margin-top: 0;
    }
    .content-box h1 { font-size: 18px; }
    .content-box h2 { font-size: 16px; color: #2563eb; }
    .content-box h3 { font-size: 15px; color: #1e293b; }
    
    .content-box p {
      margin-bottom: 14px;
    }
    .content-box ul, .content-box ol {
      margin-left: 20px;
      margin-bottom: 16px;
      padding-left: 8px;
    }
    .content-box li {
      margin-bottom: 8px;
    }
    .content-box strong {
      color: #0f172a;
      font-weight: 600;
    }
    .content-box blockquote {
      border-left: 4px solid #3b82f6;
      background: #f8fafc;
      margin: 16px 0;
      padding: 12px 18px;
      border-radius: 0 6px 6px 0;
      color: #475569;
      font-style: italic;
    }
    .content-box hr {
      border: 0;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0;
    }

    .footer {
      margin-top: 40px;
      padding-top: 18px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">${targetDoc.title || typeLabel}</h1>
      <div class="subtitle">Smart Leading Platform &bull; Documento Oficial de Liderança</div>
    </div>
    <span class="badge">${formatHumanStatus(targetDoc.status)}</span>
  </div>

  <div class="meta-box">
    <div class="meta-item">
      <strong>Colaborador / Alvo</strong>
      <span>${employeeName}</span>
    </div>
    <div class="meta-item">
      <strong>Líder Responsável</strong>
      <span>${leaderName}</span>
    </div>
    <div class="meta-item">
      <strong>Tipo de Documento</strong>
      <span>${typeLabel}</span>
    </div>
    <div class="meta-item">
      <strong>Data de Criação</strong>
      <span>${formatDatePtBr(targetDoc.createdAt)}</span>
    </div>
  </div>

  <div class="content-box">
    ${formattedHtmlContent}
  </div>

  <div class="footer">
    <span>Gerado via Smart Leading Platform &copy; ${new Date().getFullYear()}</span>
    <span>Documento protegido sob diretrizes LGPD</span>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(htmlContent);

  } catch (error) {
    console.error('[exportDocumentPdfById] Erro:', error);
    return res.status(500).json({ error: 'Erro ao exportar documento individual em PDF.' });
  }
};

/**
 * Exporta relatórios de feedbacks SBI agregados com conversão de Markdown para HTML.
 */
exports.exportSbiPdf = async (req, res) => {
  try {
    const leaderId = req.user?.uid || 'leader';
    const docsMap = loadJsonSafe(DOCS_DB_FILE, {});
    const chatMap = loadJsonSafe(CHAT_DB_FILE, {});
    const usersMap = loadJsonSafe(USERS_DB_FILE, {});

    const leaderName = resolveHumanName(leaderId, usersMap);

    let sbiDocs = [];
    Object.keys(docsMap).forEach(key => {
      const list = docsMap[key] || [];
      list.filter(d => d.type === 'sbi').forEach(doc => sbiDocs.push(doc));
    });

    const leaderChat = chatMap[leaderId] || [];
    const now = new Date().toLocaleDateString('pt-BR');

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Geral de Feedbacks SBI - Smart Leading</title>
  <style>
    body { font-family: 'Segoe UI', -apple-system, sans-serif; margin: 40px auto; max-width: 900px; color: #1e293b; background-color: #f8fafc; }
    .header { border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0; color: #4f46e5; font-size: 24px; }
    .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
    .meta-bar { background: #ffffff; border: 1px solid #e2e8f0; padding: 12px 20px; border-radius: 8px; margin-bottom: 24px; display: flex; gap: 24px; font-size: 13px; }
    .meta-bar strong { color: #64748b; margin-right: 6px; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .card-header { font-size: 16px; font-weight: bold; color: #1e1b4b; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; }
    .tag { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .meta { font-size: 12px; color: #64748b; margin-top: 6px; }
    .content { font-size: 14px; line-height: 1.7; color: #334155; margin-top: 12px; }
    .content h2, .content h3 { color: #4338ca; font-size: 15px; margin-top: 14px; margin-bottom: 6px; }
    .content p { margin-bottom: 10px; }
    .content ul, .content ol { margin-left: 20px; margin-bottom: 12px; }
    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Relatório Geral de Feedbacks SBI</h1>
      <p>Smart Leading Platform &bull; Módulo de Feedback Estruturado</p>
    </div>
    <div>
      <span class="tag">Confidencial</span>
    </div>
  </div>

  <div class="meta-bar">
    <div><strong>Líder Responsável:</strong> ${leaderName}</div>
    <div><strong>Data da Emissão:</strong> ${now}</div>
  </div>

  ${sbiDocs.length === 0 ? `
    <div class="card">
      <div class="card-header">Histórico de Roteiros Interativos (Chat SBI)</div>
      ${leaderChat.slice(-4).map((msg, i) => `
        <div style="margin-bottom: 15px;">
          <span class="tag">${msg.from === 'bot' ? 'IA Smart Leading (SBI)' : 'Relato do Líder'}</span>
          <div class="content">${marked.parse(msg.text || '')}</div>
        </div>
      `).join('<hr style="border: 0; border-top: 1px dashed #e2e8f0; margin: 15px 0;">')}
    </div>
  ` : sbiDocs.map(doc => `
    <div class="card">
      <div class="card-header">
        <span>${doc.title || 'Feedback SBI'} &bull; ${resolveHumanName(doc.employeeId || doc.employeeName, usersMap)}</span>
        <span class="tag">${formatHumanStatus(doc.status)}</span>
      </div>
      <div class="meta">Data de Criação: ${formatDatePtBr(doc.createdAt)}</div>
      <div class="content">${marked.parse(doc.content || '')}</div>
    </div>
  `).join('')}

  <div class="footer">
    Smart Leading &copy; ${new Date().getFullYear()} - Sistema de Liderança Humanizada com IA. Todos os direitos reservados.
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-geral-sbi.html"');
    return res.status(200).send(htmlContent);

  } catch (error) {
    console.error('[exportSbiPdf] Erro ao gerar relatório:', error);
    return res.status(500).json({ error: 'Erro ao gerar relatório SBI.' });
  }
};
