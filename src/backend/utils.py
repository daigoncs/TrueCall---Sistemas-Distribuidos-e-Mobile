import sqlite3

from flask import request, jsonify


def validar_campos_obrigatorios(dados, campos):
    """Return an error response tuple if any required field is missing, else None."""
    for campo in campos:
        if not dados or not dados.get(campo):
            return jsonify({"erro": f"Campo '{campo}' é obrigatório"}), 400
    return None


def resolver_nome_outro(nome_padrao, nome_personalizado):
    """Resolve display name when the standard name is 'Outro'."""
    if nome_padrao == "Outro" and nome_personalizado:
        return nome_personalizado
    return nome_padrao


DENUNCIA_SELECT_COLUMNS = """
    d.id,
    d.telefone,
    d.descricao,
    d.data_denuncia,
    d.instituicao_personalizada,
    d.tipo_golpe_personalizado,
    d.instituicao_id,
    d.tipo_golpe_id,
    d.estado,
    i.nome AS instituicao,
    t.nome AS tipo_golpe,
    (SELECT COUNT(*) FROM voto_denuncia v WHERE v.denuncia_id = d.id) AS votos,
    EXISTS(
        SELECT 1 FROM voto_denuncia v
        WHERE v.denuncia_id = d.id AND v.usuario_id = ?
    ) AS votou
"""

DENUNCIA_BASE_JOINS = """
    FROM denuncia d
    JOIN instituicao i ON d.instituicao_id = i.id
    JOIN tipo_golpe t  ON d.tipo_golpe_id  = t.id
"""


def ensure_column_exists(db, table, column, col_type="TEXT"):
    """Add a column to a table if it doesn't already exist."""
    try:
        db.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
        db.commit()
    except sqlite3.OperationalError:
        pass
