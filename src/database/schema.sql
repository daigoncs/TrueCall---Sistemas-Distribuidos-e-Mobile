CREATE TABLE usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instituicao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE tipo_golpe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE denuncia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telefone TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data_denuncia DATETIME DEFAULT CURRENT_TIMESTAMP,

    usuario_id INTEGER NOT NULL,
    instituicao_id INTEGER NOT NULL,
    instituicao_personalizada TEXT,

    tipo_golpe_id INTEGER NOT NULL,
    tipo_golpe_personalizado TEXT,
    estado TEXT,

    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (instituicao_id) REFERENCES instituicao(id),
    FOREIGN KEY (tipo_golpe_id) REFERENCES tipo_golpe(id),

    UNIQUE(usuario_id, telefone)
);

CREATE TABLE numero_confiavel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instituicao TEXT NOT NULL,
    numero TEXT NOT NULL,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    UNIQUE(usuario_id, instituicao, numero)
);

CREATE TABLE voto_denuncia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    denuncia_id INTEGER NOT NULL,
    usuario_id  INTEGER NOT NULL,
    data_voto   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (denuncia_id) REFERENCES denuncia(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id)  REFERENCES usuario(id),
    UNIQUE(denuncia_id, usuario_id)
);