create database if not exists gymapp
default character set utf8
default collate utf8_general_ci;

use gymapp;

create table usuario (
	id_usuario integer unsigned not null auto_increment,
    nome_usuario varchar(45) not null,
	email varchar(45) not null unique,
    senha varchar(30) not null,
    data_nascimento date not null,
    sexo enum('M', 'F'),
    altura float unsigned not null,
    peso_usuario float unsigned not null,
    primary key (id_usuario)
) default charset = utf8;

create table planilhaTreino (
	id_planilhaTreino integer unsigned not null auto_increment,
    id_usuario integer unsigned,
    nome_planilhaTreino varchar(30) unique not null,
    data_inicio date not null,
    ativa_planilhaTreino boolean not null default false,
    primary key (id_planilhaTreino),
    foreign key (id_usuario) references usuario (id_usuario)
) default charset = utf8;

create table exercicio (
	id_exercicio integer unsigned not null auto_increment,
    nome_exercicio varchar(45) not null unique,
    grupo_muscular varchar(30) not null,
    descricao_exercicio text,
    primary key (id_exercicio)
) default charset = utf8;

create table treino (
	id_treino integer unsigned not null auto_increment,
    id_planilhaTreino integer unsigned,
    id_exercicio integer unsigned,
    series integer unsigned not null,
    repeticoes_treino integer unsigned not null,
    carga_treino float unsigned,
    primary key (id_treino),
    foreign key (id_planilhaTreino) references planilhaTreino (id_planilhaTreino),
    foreign key (id_exercicio) references exercicio (id_exercicio)
) default charset = utf8;

create table progressoCarga (
	id_progressoCarga integer unsigned not null auto_increment,
    id_usuario integer unsigned,
    id_exercicio integer unsigned,
    dia_progressoCarga date not null,
    repeticoes_progressoCarga integer unsigned not null,
    carga_progressoCarga float not null,
    primary key (id_progressoCarga),
    foreign key (id_usuario) references usuario (id_usuario),
    foreign key (id_exercicio) references exercicio (id_exercicio)
) default charset = utf8;

create table pesoCorporal (
	id_pesoCorporal integer unsigned not null auto_increment,
    id_usuario integer unsigned,
    dia_pesoCorporal date not null,
    peso_pesoCorporal float unsigned not null,
    meta_peso float unsigned,
    primary key (id_pesoCorporal),
    foreign key (id_usuario) references usuario (id_usuario)
) default charset = utf8;

create table medidaCorporal (
	id_medidaCorporal integer unsigned not null auto_increment,
    id_usuario integer unsigned,
    dia_medidaCorporal date not null,
    regiao_medidaCorporal varchar(20) not null,
    medida_cm float unsigned not null,
    primary key (id_medidaCorporal),
    foreign key (id_usuario) references usuario (id_usuario)
) default charset = utf8;

create table refeicao (
	id_refeicao integer unsigned not null auto_increment,
    id_usuario integer unsigned,
    dia_refeicao date not null,
    descricao_refeicao text not null,
    primary key (id_refeicao),
    foreign key (id_usuario) references usuario (id_usuario)
) default charset = utf8;

create table alimento (
	id_alimento integer unsigned not null auto_increment,
    nome_alimento varchar(45) not null unique,
    calorias_alimento float unsigned not null,
    proteinas_alimento float unsigned not null,
    carboidratos_alimento float unsigned not null,
    gorduras_alimento float unsigned not null,
    primary key (id_alimento)
) default charset = utf8;

create table refeicaoAlimento (
	id_refeicaoAlimento integer unsigned not null auto_increment,
    id_refeicao integer unsigned,
    id_alimento integer unsigned,
    qtde_gramas float unsigned not null,
    primary key (id_refeicaoAlimento),
    foreign key (id_refeicao) references refeicao (id_refeicao),
    foreign key (id_alimento) references alimento (id_alimento)
) default charset = utf8;

create table caloriasDiarias (
	id_caloriasDiarias integer unsigned not null auto_increment,
    id_usuario integer unsigned,
    data_caloriasDiarias date not null,
    caloriais_totais float unsigned,
    proteinas_caloriasDiarias float unsigned,
    carboidratos_caloriasDiarias float unsigned,
    gorduras_caloriasDiarias float unsigned,    
    primary key (id_caloriasDiarias),
    foreign key (id_usuario) references usuario (id_usuario)
) default charset = utf8;

create table passos (
	id_passos integer unsigned not null auto_increment,
    id_usuario integer unsigned,
    dia_passos date not null,
    qtde_metros float unsigned,
    primary key (id_passos),
    foreign key (id_usuario) references usuario (id_usuario)
) default charset = utf8;

create table historicoTreino (
	id_historicoTreino integer unsigned not null auto_increment,
    id_usuario integer unsigned,
    id_exercicio integer unsigned,
    dia_historicoTreino date not null,
    series_feitas integer unsigned not null,
    repeticoes_feitas integer unsigned not null,
    carga_utilizada float unsigned,
    primary key (id_historicoTreino),
    foreign key (id_usuario) references usuario (id_usuario),
    foreign key (id_exercicio) references exercicio (id_exercicio)
) default charset = utf8;