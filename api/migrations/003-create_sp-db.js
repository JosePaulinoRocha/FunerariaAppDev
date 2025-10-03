'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get_Egresos_Por_Filtros
    await queryInterface.sequelize.query(`
      CREATE DEFINER=\`root\`@\`localhost\` PROCEDURE Get_Egresos_Por_Filtros(
          IN p_segmento INT,
          IN p_categoria INT,
          IN p_subcategoria INT,
          IN p_concepto INT,
          IN p_FechaFiltroInicial DATETIME,
          IN p_FechaFiltroFinal DATETIME,
          IN p_reconciliado INT
      )
      BEGIN
          DECLARE v_sql VARCHAR(1000);
          SET v_sql = 'SELECT * FROM egresos WHERE TipoIngreso = 1';
          IF p_segmento IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND SegmentoID = ', p_segmento);
          END IF;
          IF p_categoria IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND CategoriaID = ', p_categoria);
          END IF;
          IF p_subcategoria IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND SubcategoriaID = ', p_subcategoria);
          END IF;
          IF p_concepto IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND ConceptoID = ', p_concepto);
          END IF;
          IF p_FechaFiltroInicial IS NOT NULL AND p_FechaFiltroFinal IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND Fecha BETWEEN "', p_FechaFiltroInicial, '" AND "', p_FechaFiltroFinal, '"');
          ELSEIF p_FechaFiltroInicial IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND Fecha >= "', p_FechaFiltroInicial, '"');
          ELSEIF p_FechaFiltroFinal IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND Fecha <= "', p_FechaFiltroFinal, '"');
          END IF;
          IF p_reconciliado IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND Reconciliado = ', p_reconciliado);
          END IF;
          SET @sql_query = v_sql;
          PREPARE stmt FROM @sql_query;
          EXECUTE stmt;
          DEALLOCATE PREPARE stmt;
      END
    `);

    // Get_Ingresos_Por_Filtros
    await queryInterface.sequelize.query(`
      CREATE DEFINER=\`root\`@\`%\` PROCEDURE Get_Ingresos_Por_Filtros(
          IN p_segmento INT,
          IN p_categoria INT,
          IN p_subcategoria INT,
          IN p_concepto INT,
          IN p_FechaFiltroInicial DATETIME,
          IN p_FechaFiltroFinal DATETIME
      )
      BEGIN
          DECLARE v_sql VARCHAR(1000);
          SET v_sql = 'SELECT IngresoID, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, Descripcion, Monto FROM ingresos WHERE Reconciliado = 0';
          IF p_segmento IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND SegmentoID = ', p_segmento);
          END IF;
          IF p_categoria IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND CategoriaID = ', p_categoria);
          END IF;
          IF p_subcategoria IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND SubcategoriaID = ', p_subcategoria);
          END IF;
          IF p_concepto IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND ConceptoID = ', p_concepto);
          END IF;
          IF p_FechaFiltroInicial IS NOT NULL AND p_FechaFiltroFinal IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND Fecha BETWEEN "', p_FechaFiltroInicial, '" AND "', p_FechaFiltroFinal, '"');
          ELSEIF p_FechaFiltroInicial IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND Fecha >= "', p_FechaFiltroInicial, '"');
          ELSEIF p_FechaFiltroFinal IS NOT NULL THEN
              SET v_sql = CONCAT(v_sql, ' AND Fecha <= "', p_FechaFiltroFinal, '"');
          END IF;
          SET @sql_query = v_sql;
          PREPARE stmt FROM @sql_query;
          EXECUTE stmt;
          DEALLOCATE PREPARE stmt;
      END
    `);

    // ObtenerReporteEgresos
    await queryInterface.sequelize.query(`
      CREATE DEFINER=\`root\`@\`localhost\` PROCEDURE ObtenerReporteEgresos(IN anio INT, IN mes INT)
      BEGIN
          SELECT 
              i.SegmentoID AS SegmentoID,
              s.Nombre AS NombreSegmento,
              i.CategoriaID AS CategoriaID,
              cat.Nombre AS NombreCategoria,
              i.SubcategoriaID AS SubcategoriaID,
              subcat.Nombre AS NombreSubcategoria,
              i.ConceptoID AS ConceptoID,
              c.Nombre AS NombreConcepto,
              ROUND(SUM(i.Monto), 2) AS TotalMonto,
              ROUND(SUM(i.Piezas), 2) AS TotalPiezas,
              ROUND(CASE
                  WHEN COUNT(DISTINCT i.Fecha) > 1 THEN
                      (TO_DAYS(MAX(i.Fecha)) - TO_DAYS(MIN(i.Fecha))) / 
                      (COUNT(DISTINCT i.Fecha) - 1)
                  ELSE 0
              END, 2) AS FrecuenciaPromedio,
              MAX(i.Fecha) AS UltimaFecha
          FROM ingresos i
              LEFT JOIN segmentos s ON i.SegmentoID = s.SegmentoID
              LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID
              LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID
              LEFT JOIN conceptos c ON i.ConceptoID = c.ConceptoID
          WHERE i.TipoIngreso = 1
              AND YEAR(i.Fecha) = anio
              AND MONTH(i.Fecha) = mes
              AND i.Reconciliado = 1
          GROUP BY i.SegmentoID, s.Nombre, i.CategoriaID, cat.Nombre, i.SubcategoriaID, subcat.Nombre, i.ConceptoID, c.Nombre
          HAVING TotalMonto > 0 OR TotalPiezas > 0 OR FrecuenciaPromedio > 0;
      END
    `);

    // ObtenerReporteIngresos
    await queryInterface.sequelize.query(`
      CREATE DEFINER=\`root\`@\`localhost\` PROCEDURE ObtenerReporteIngresos(IN anio INT, IN mes INT)
      BEGIN
          SELECT 
              i.SegmentoID AS SegmentoID,
              s.Nombre AS NombreSegmento,
              i.CategoriaID AS CategoriaID,
              cat.Nombre AS NombreCategoria,
              i.SubcategoriaID AS SubcategoriaID,
              subcat.Nombre AS NombreSubcategoria,
              i.ConceptoID AS ConceptoID,
              c.Nombre AS NombreConcepto,
              ROUND(SUM(i.Monto), 2) AS TotalMonto,
              ROUND(SUM(i.Piezas), 2) AS TotalPiezas,
              ROUND(CASE
                  WHEN COUNT(DISTINCT i.Fecha) > 1 THEN
                      (TO_DAYS(MAX(i.Fecha)) - TO_DAYS(MIN(i.Fecha))) / 
                      (COUNT(DISTINCT i.Fecha) - 1)
                  ELSE 0
              END, 2) AS FrecuenciaPromedio,
              MAX(i.Fecha) AS UltimaFecha
          FROM ingresos i
              LEFT JOIN segmentos s ON i.SegmentoID = s.SegmentoID
              LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID
              LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID
              LEFT JOIN conceptos c ON i.ConceptoID = c.ConceptoID
          WHERE i.TipoIngreso = 0
              AND YEAR(i.Fecha) = anio
              AND MONTH(i.Fecha) = mes
              AND i.Reconciliado = 1
          GROUP BY i.SegmentoID, s.Nombre, i.CategoriaID, cat.Nombre, i.SubcategoriaID, subcat.Nombre, i.ConceptoID, c.Nombre
          HAVING TotalMonto > 0 OR TotalPiezas > 0 OR FrecuenciaPromedio > 0;
      END
    `);

    // ObtenerTotalEgresos
    await queryInterface.sequelize.query(`
      CREATE DEFINER=\`root\`@\`localhost\` PROCEDURE ObtenerTotalEgresos(IN anio INT, IN mes INT)
      BEGIN
          SELECT SUM(i.Monto) AS TotalEgresos
          FROM ingresos i
          WHERE i.TipoIngreso = 1
              AND YEAR(i.Fecha) = anio
              AND MONTH(i.Fecha) = mes
              AND i.Reconciliado = 1;
      END
    `);

    // ObtenerTotalIngresos
    await queryInterface.sequelize.query(`
      CREATE DEFINER=\`root\`@\`localhost\` PROCEDURE ObtenerTotalIngresos(IN anio INT, IN mes INT)
      BEGIN
          SELECT SUM(i.Monto) AS TotalIngresos
          FROM ingresos i
          WHERE i.TipoIngreso = 0
              AND YEAR(i.Fecha) = anio
              AND MONTH(i.Fecha) = mes
              AND i.Reconciliado = 1;
      END
    `);

    // obtener_datos_json
    await queryInterface.sequelize.query(`
      CREATE DEFINER=\`root\`@\`localhost\` PROCEDURE obtener_datos_json()
      BEGIN
          DECLARE segmentos TEXT;
          DECLARE categorias TEXT;
          DECLARE subcategorias TEXT;
          DECLARE conceptos TEXT;

          SET SESSION group_concat_max_len = 100000;

          SELECT CONCAT('[', GROUP_CONCAT(CONCAT('{\"SegmentoID\":', SegmentoID, ',\"Nombre\":\"', Nombre, '\"}')), ']') INTO segmentos FROM segmentos;
          SELECT CONCAT('[', GROUP_CONCAT(CONCAT('{\"CategoriaID\":', CategoriaID, ',\"Nombre\":\"', Nombre, '\"}')), ']') INTO categorias FROM categorias;
          SELECT CONCAT('[', GROUP_CONCAT(CONCAT('{\"SubcategoriaID\":', SubcategoriaID, ',\"Nombre\":\"', Nombre, '\"}')), ']') INTO subcategorias FROM subcategorias;
          SELECT CONCAT('[', GROUP_CONCAT(CONCAT('{\"ConceptoID\":', ConceptoID, ',\"Nombre\":\"', Nombre, '\"}')), ']') INTO conceptos FROM conceptos;

          SELECT CONCAT(
              '{',
                  '\"segmentos\":', segmentos, ',',
                  '\"categorias\":', categorias, ',',
                  '\"subcategorias\":', subcategorias, ',',
                  '\"conceptos\":', conceptos,
              '}'
          ) AS resultados;
      END
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS Get_Egresos_Por_Filtros;`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS Get_Ingresos_Por_Filtros;`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ObtenerReporteEgresos;`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ObtenerReporteIngresos;`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ObtenerTotalEgresos;`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ObtenerTotalIngresos;`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS obtener_datos_json;`);
  }
};
