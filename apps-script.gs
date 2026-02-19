// ═══════════════════════════════════════════════════════════════
//  Google Apps Script — Backend para cadastro de termos
// ═══════════════════════════════════════════════════════════════
//
//  COMO USAR:
//  1. Vá em https://script.google.com e crie um novo projeto
//  2. Cole este código no editor
//  3. Substitua SPREADSHEET_ID abaixo pelo ID da sua planilha
//  4. Clique em "Implantar" > "Nova implantação"
//  5. Tipo: "App da Web"
//  6. Executar como: "Eu" (sua conta)
//  7. Quem tem acesso: "Qualquer pessoa" (para funcionar sem login)
//  8. Copie a URL gerada e cole na configuração do Glossário (⚙)
//
// ═══════════════════════════════════════════════════════════════

const SPREADSHEET_ID = 'COLE_SEU_SPREADSHEET_ID_AQUI';

function doPost(e) {
  try {
    // The browser sends the body as text/plain (no preflight) so
    // e.postData.contents holds the raw JSON string regardless of
    // the content-type. Parse it directly.
    const raw = e.postData ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    if (!data.sheet || !data.original) {
      throw new Error('Campos obrigatórios ausentes: sheet, original');
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Encontra a aba pelo nome; se não existir, cria
    let sheet = ss.getSheetByName(data.sheet);
    if (!sheet) {
      sheet = ss.insertSheet(data.sheet);
      // Adiciona cabeçalho na nova aba
      sheet.appendRow(['ORIGINAL', 'TRADUÇÃO', 'IDENTIDADE SECRETA, ETC.', 'FILIAÇÃO', 'FONTE']);
    }

    // Adiciona a nova linha
    sheet.appendRow([
      data.original || '',
      data.traducao || '',
      data.info || '',
      data.filiacao || '',
      data.fonte || '',
    ]);

    // Apps Script ContentService always adds Access-Control-Allow-Origin: *
    // automatically for Web Apps set to "Anyone". Returning JSON here allows
    // the browser to read the response when CORS is satisfied.
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// doGet: health-check e também responde ao redirect que o Apps Script faz
// após um POST bem-sucedido (o navegador segue o 302 com GET).
function doGet(e) {
  // Se vier um parâmetro ?result=... do redirect interno, repassá-lo.
  const result = e && e.parameter && e.parameter.result;
  if (result) {
    return ContentService
      .createTextOutput(result)
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Glossário DC — Apps Script ativo' }))
    .setMimeType(ContentService.MimeType.JSON);
}
