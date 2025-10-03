'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

        // vistaingresos
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW vistaingresos AS
      select 
        i.IngresoID AS IngresoID,
        i.Fecha AS Fecha,
        i.ConceptoID AS ConceptoID,
        c.Nombre AS NombreConcepto,
        i.Descripcion AS Descripcion,
        i.ProveedorID AS ProveedorID,
        p.Proveedor AS Proveedor,
        p.Estatus AS ProveedorEstatus,
        i.Piezas AS Piezas,
        i.Monto AS Monto,
        i.MontoParcial AS MontoParcial,
        i.MontoParcialBandera AS MontoParcialBandera,
        i.Saldo AS Saldo,
        i.Comprobante AS Comprobante,
        i.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        i.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        i.SubcategoriaID AS SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        i.EstatusComprobacionID AS EstatusComprobacionID,
        est.Descripcion AS NombreEstatus,
        i.FechaAutorizacion AS FechaAutorizacion,
        i.UsuarioAutorizaID AS UsuarioAutorizaID,
        ua.fullName AS NombreUsuarioAutoriza,
        i.UsuarioRecibeID AS UsuarioRecibeID,
        ur.fullName AS NombreUsuarioRecibe,
        i.FechaConciliacion AS FechaConciliacion,
        i.ObservacionesDifConciliacion AS ObservacionesDifConciliacion,
        cu.TipoCuentaID AS TipoCuentaID,
        cu.CuentaID AS CuentaID,
        tc.NombreTipoCuenta AS TipoCuenta,
        cu.NombreCuenta AS NombreCuenta,
        cu.RFC AS RFC,
        i.Reconciliado AS Reconciliado,
        i.TipoIngreso AS TipoIngreso,
        i.ReconciliacionID AS ReconciliacionID,
        r.Saldo AS SaldoReconciliacion,
        i.CuentaContable AS CuentaContable
      from ingresos i
      left join conceptos c on i.ConceptoID = c.ConceptoID
      left join segmentos s on i.SegmentoID = s.SegmentoID
      left join categorias cat on i.CategoriaID = cat.CategoriaID
      left join subcategorias subcat on i.SubcategoriaID = subcat.SubcategoriaID
      left join estatuscomprobacion est on i.EstatusComprobacionID = est.EstatusID
      left join usuarios ua on i.UsuarioAutorizaID = ua.userId
      left join usuarios ur on i.UsuarioRecibeID = ur.userId
      left join cuentas cu on i.CuentaID = cu.CuentaID
      left join tipos_cuenta tc on cu.TipoCuentaID = tc.TipoCuentaID
      left join reconciliaciones r on i.ReconciliacionID = r.ReconciliacionID
      left join proveedores p on i.ProveedorID = p.ProveedorID;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ingresos_totales_vw AS
      SELECT 
        m.Anio AS Anio,
        m.MesNumero AS MesNumero,
        IFNULL(SUM(i.Monto),0) AS IngresoTotal
      FROM (
        SELECT YEAR(CURDATE() - INTERVAL nums.n MONTH) AS Anio,
               MONTH(CURDATE() - INTERVAL nums.n MONTH) AS MesNumero
        FROM (
          SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
          UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
          UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
        ) nums
      ) m
      LEFT JOIN ingresos i
        ON YEAR(i.Fecha) = m.Anio AND MONTH(i.Fecha) = m.MesNumero
       AND i.TipoIngreso = 0 AND i.Reconciliado = 1
      GROUP BY m.Anio, m.MesNumero
      ORDER BY m.Anio DESC, m.MesNumero DESC;
    `);

    // Vista: egresos_totales_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW egresos_totales_vw AS
      SELECT 
        m.Anio AS Anio,
        m.MesNumero AS MesNumero,
        IFNULL(SUM(i.Monto),0) AS EgresoTotal
      FROM (
        SELECT YEAR(CURDATE() - INTERVAL nums.n MONTH) AS Anio,
               MONTH(CURDATE() - INTERVAL nums.n MONTH) AS MesNumero
        FROM (
          SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
          UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
          UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
        ) nums
      ) m
      LEFT JOIN ingresos i
        ON YEAR(i.Fecha) = m.Anio AND MONTH(i.Fecha) = m.MesNumero
       AND i.TipoIngreso = 1 AND i.Reconciliado = 1
      GROUP BY m.Anio, m.MesNumero
      ORDER BY m.Anio DESC, m.MesNumero DESC;
    `);

    // presupuesto_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW presupuesto_vw AS
      SELECT 
        i.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        i.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        i.SubcategoriaID AS SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        i.ConceptoID AS ConceptoID,
        c.Nombre AS NombreConcepto,
        ROUND(AVG(CASE WHEN i.Fecha >= CURDATE() - INTERVAL 6 MONTH THEN i.Monto ELSE NULL END),2) AS PromedioMonto,
        ROUND(AVG(CASE WHEN i.Fecha >= CURDATE() - INTERVAL 6 MONTH THEN i.Piezas ELSE NULL END),2) AS PromedioPiezas,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT CASE WHEN i.Fecha >= CURDATE() - INTERVAL 6 MONTH THEN i.Fecha ELSE NULL END) > 1
            THEN (TO_DAYS(MAX(CASE WHEN i.Fecha >= CURDATE() - INTERVAL 6 MONTH THEN i.Fecha ELSE NULL END)) - TO_DAYS(MIN(CASE WHEN i.Fecha >= CURDATE() - INTERVAL 6 MONTH THEN i.Fecha ELSE NULL END))) / 
                 (COUNT(DISTINCT CASE WHEN i.Fecha >= CURDATE() - INTERVAL 6 MONTH THEN i.Fecha ELSE NULL END) - 1)
            ELSE 0
          END, 2
        ) AS FrecuenciaPromedio,
        MAX(i.Fecha) AS UltimaFecha,
        pm.MontoDictaminado AS MontoDictaminado,
        pm.FrecuenciaDictaminada AS FrecuenciaDictaminada,
        pm.CajaChica AS CajaChica,
        pm.DiaLimite AS DiaLimite,
        cu.CuentaID AS CuentaID,
        cu.TipoCuentaID AS TipoCuentaID,
        cu.NombreCuenta AS NombreCuenta,
        cu.RFC AS RFC
      FROM vistaingresos i
      LEFT JOIN segmentos s ON i.SegmentoID = s.SegmentoID
      LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID
      LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID
      LEFT JOIN conceptos c ON i.ConceptoID = c.ConceptoID
      LEFT JOIN presupuesto_manual pm ON i.SegmentoID = pm.SegmentoID AND i.CategoriaID = pm.CategoriaID AND i.SubcategoriaID = pm.SubcategoriaID AND i.ConceptoID = pm.ConceptoID
      LEFT JOIN cuentas cu ON pm.CuentaID = cu.CuentaID
      WHERE i.TipoIngreso = 1
        AND i.SegmentoID IS NOT NULL
        AND i.CategoriaID IS NOT NULL
        AND i.SubcategoriaID IS NOT NULL
        AND i.ConceptoID IS NOT NULL
      GROUP BY i.SegmentoID, s.Nombre, i.CategoriaID, cat.Nombre, i.SubcategoriaID, subcat.Nombre, i.ConceptoID, c.Nombre, pm.MontoDictaminado, pm.FrecuenciaDictaminada, pm.CajaChica, pm.DiaLimite, cu.TipoCuentaID, cu.NombreCuenta, cu.RFC
      HAVING PromedioMonto IS NOT NULL OR PromedioPiezas IS NOT NULL OR FrecuenciaPromedio > 0;
    `);

    // gastos_mensuales_por_frecuencia_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW gastos_mensuales_por_frecuencia_vw AS
      SELECT 
        pm.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        pm.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        pm.SubcategoriaID AS SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        pm.ConceptoID AS ConceptoID,
        c.Nombre AS NombreConcepto,
        pm.MontoDictaminado AS MontoDictaminado,
        pm.FrecuenciaDictaminada AS FrecuenciaDictaminada,
        CASE WHEN gfmc.CuentaID IS NOT NULL THEN gfmc.CuentaID ELSE CASE WHEN pm.CajaChica = 1 THEN NULL ELSE pm.CuentaID END END AS CuentaID,
        cu.TipoCuentaID AS TipoCuentaID,
        COALESCE((SELECT cu2.NombreCuenta FROM cuentas cu2 WHERE cu2.CuentaID = COALESCE(gfmc.CuentaID, pm.CuentaID) LIMIT 1), cu.NombreCuenta) AS NombreCuenta,
        CASE WHEN gfmc.CajaChica = 1 THEN 1 WHEN gfmc.CajaChica = 0 THEN 0 ELSE COALESCE(pm.CajaChica,0) END AS CajaChica,
        pm.DiaLimite AS DiaLimite,
        pv.PromedioMonto AS PromedioMonto,
        pv.PromedioPiezas AS PromedioPiezas,
        pv.FrecuenciaPromedio AS FrecuenciaPromedio,
        pv.UltimaFecha AS UltimaFecha,
        pv.UltimaFecha + INTERVAL pm.FrecuenciaDictaminada DAY AS FechaSiguienteGasto,
        CASE WHEN pv.UltimaFecha IS NOT NULL THEN TO_DAYS(pv.UltimaFecha + INTERVAL pm.FrecuenciaDictaminada DAY) - TO_DAYS(CURDATE()) ELSE NULL END AS DiasPendientes,
        CASE WHEN gpf.GastoFrecuenciaID IS NOT NULL THEN gpf.PeriodoID ELSE COALESCE(pc.PeriodoID,0) END AS PeriodoID,
        CASE WHEN gpf.GastoFrecuenciaID IS NOT NULL THEN 
          (SELECT CONCAT(DATE_FORMAT(pc.FechaInicio,'%Y-%m-%d'),' al ',DATE_FORMAT(pc.FechaFin,'%Y-%m-%d')) 
           FROM periodos_congelados pc WHERE pc.PeriodoID = gpf.PeriodoID)
          ELSE CONCAT(DATE_FORMAT(pc.FechaInicio,'%Y-%m-%d'),' al ',DATE_FORMAT(pc.FechaFin,'%Y-%m-%d'))
        END AS PeriodoCongelado,
        CASE WHEN gpf.GastoFrecuenciaID IS NOT NULL THEN 1 ELSE 0 END AS Guardado,
        CASE WHEN pm.CajaChica = 1 THEN NULL ELSE pm.CuentaID END AS CuentaID_Actualizado
      FROM presupuesto_manual pm
      LEFT JOIN presupuesto_vw pv ON pm.SegmentoID = pv.SegmentoID AND pm.CategoriaID = pv.CategoriaID AND pm.SubcategoriaID = pv.SubcategoriaID AND pm.ConceptoID = pv.ConceptoID
      LEFT JOIN segmentos s ON pm.SegmentoID = s.SegmentoID
      LEFT JOIN categorias cat ON pm.CategoriaID = cat.CategoriaID
      LEFT JOIN subcategorias subcat ON pm.SubcategoriaID = subcat.SubcategoriaID
      LEFT JOIN conceptos c ON pm.ConceptoID = c.ConceptoID
      LEFT JOIN cuentas cu ON pm.CuentaID = cu.CuentaID
      LEFT JOIN periodos_congelados pc ON pv.UltimaFecha + INTERVAL pm.FrecuenciaDictaminada DAY BETWEEN pc.FechaInicio AND pc.FechaFin
      LEFT JOIN gastos_presupuesto_frecuencia gpf ON pm.SegmentoID = gpf.SegmentoID AND pm.CategoriaID = gpf.CategoriaID AND pm.SubcategoriaID = gpf.SubcategoriaID AND pm.ConceptoID = gpf.ConceptoID AND pv.UltimaFecha = gpf.UltimaFecha
      LEFT JOIN gastos_frecuencia_mensuales_cuentas gfmc ON pm.SegmentoID = gfmc.SegmentoID AND pm.CategoriaID = gfmc.CategoriaID AND pm.SubcategoriaID = gfmc.SubcategoriaID AND pm.ConceptoID = gfmc.ConceptoID AND gfmc.PeriodoID = COALESCE(gpf.PeriodoID, pc.PeriodoID)
      WHERE pv.UltimaFecha IS NOT NULL
        AND pm.FrecuenciaDictaminada BETWEEN 14 AND 180
        AND (cu.NombreCuenta IS NOT NULL OR pm.CajaChica = 1);
    `);

    // combinaciones_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW combinaciones_vw AS
      select 
        c.CombinacionID AS CombinacionID,
        c.ConceptoID AS ConceptoID,
        con.Nombre AS NombreConcepto,
        c.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        c.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        c.SubcategoriaID AS SubcategoriaID,
        sub.Nombre AS NombreSubcategoria,
        c.FechaModificacion AS FechaModificacion,
        c.validado AS validado
      from combinaciones c
      left join conceptos con on c.ConceptoID = con.ConceptoID
      left join segmentos s on c.SegmentoID = s.SegmentoID
      left join categorias cat on c.CategoriaID = cat.CategoriaID
      left join subcategorias sub on c.SubcategoriaID = sub.SubcategoriaID;
    `);

    // reporte_egresos_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW reporte_egresos_vw AS
      select 
        i.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        i.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        i.SubcategoriaID AS SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        i.ConceptoID AS ConceptoID,
        c.Nombre AS NombreConcepto,
        round(sum(case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') and i.Fecha <= last_day(curdate() - interval 1 month) then i.Monto else 0 end),2) AS TotalMonto,
        round(sum(case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') and i.Fecha <= last_day(curdate() - interval 1 month) then i.Piezas else 0 end),2) AS TotalPiezas,
        round(case when count(distinct case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end) > 1 then (to_days(max(case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end)) - to_days(min(case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end))) / (count(distinct case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end) - 1) else 0 end,2) AS FrecuenciaPromedio,
        max(i.Fecha) AS UltimaFecha
      from vistaingresos i
      left join segmentos s on i.SegmentoID = s.SegmentoID
      left join categorias cat on i.CategoriaID = cat.CategoriaID
      left join subcategorias subcat on i.SubcategoriaID = subcat.SubcategoriaID
      left join conceptos c on i.ConceptoID = c.ConceptoID
      left join presupuesto_manual pm on i.SegmentoID = pm.SegmentoID and i.CategoriaID = pm.CategoriaID and i.SubcategoriaID = pm.SubcategoriaID and i.ConceptoID = pm.ConceptoID
      left join cuentas cu on pm.CuentaID = cu.CuentaID
      where i.TipoIngreso = 1 and i.SegmentoID is not null and i.CategoriaID is not null and i.SubcategoriaID is not null and i.ConceptoID is not null and i.Reconciliado = 1
      group by i.SegmentoID, s.Nombre, i.CategoriaID, cat.Nombre, i.SubcategoriaID, subcat.Nombre, i.ConceptoID, c.Nombre;
    `);

    // gastos_mensuales_semanales_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW gastos_mensuales_semanales_vw AS
      select 
        i.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        i.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        i.SubcategoriaID AS SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        i.ConceptoID AS ConceptoID,
        c.Nombre AS NombreConcepto,
        round(avg(case when i.Fecha >= curdate() - interval 6 month then i.Monto else NULL end),2) AS PromedioMonto,
        round(avg(case when i.Fecha >= curdate() - interval 6 month then i.Piezas else NULL end),2) AS PromedioPiezas,
        round(case when count(distinct case when i.Fecha >= curdate() - interval 6 month then i.Fecha else NULL end) > 1 then (to_days(max(case when i.Fecha >= curdate() - interval 6 month then i.Fecha else NULL end)) - to_days(min(case when i.Fecha >= curdate() - interval 6 month then i.Fecha else NULL end))) / (count(distinct case when i.Fecha >= curdate() - interval 6 month then i.Fecha else NULL end) - 1) else 0 end,2) AS FrecuenciaPromedio,
        max(i.Fecha) AS UltimaFecha,
        pm.MontoDictaminado AS MontoDictaminado,
        pm.FrecuenciaDictaminada AS FrecuenciaDictaminada,
        case when gs.CajaChica = 1 then 1 else pm.CajaChica end AS CajaChica,
        pm.DiaLimite AS DiaLimite,
        case when gs.CajaChica = 1 then NULL else coalesce(gs.CuentaID,cu.CuentaID) end AS CuentaID,
        cu.TipoCuentaID AS TipoCuentaID,
        coalesce((select cu2.NombreCuenta from cuentas cu2 where cu2.CuentaID = gs.CuentaID limit 1),cu.NombreCuenta) AS NombreCuenta,
        cu.RFC AS RFC,
        pc.PeriodoID AS PeriodoID,
        concat(date_format(pc.FechaInicio,'%Y-%m-%d'),' al ',date_format(pc.FechaFin,'%Y-%m-%d')) AS PeriodoCongelado
      from vistaingresos i
      left join segmentos s on i.SegmentoID = s.SegmentoID
      left join categorias cat on i.CategoriaID = cat.CategoriaID
      left join subcategorias subcat on i.SubcategoriaID = subcat.SubcategoriaID
      left join conceptos c on i.ConceptoID = c.ConceptoID
      left join presupuesto_manual pm on i.SegmentoID = pm.SegmentoID and i.CategoriaID = pm.CategoriaID and i.SubcategoriaID = pm.SubcategoriaID and i.ConceptoID = pm.ConceptoID
      left join cuentas cu on pm.CuentaID = cu.CuentaID
      left join periodos_congelados pc on pc.FechaInicio <= last_day(curdate()) and pc.FechaFin >= date_format(curdate(),'%Y-%m-01')
      left join gastos_semanales_mensuales_cuentas gs on i.SegmentoID = gs.SegmentoID and i.CategoriaID = gs.CategoriaID and i.SubcategoriaID = gs.SubcategoriaID and i.ConceptoID = gs.ConceptoID and pc.PeriodoID = gs.PeriodoID
      where i.TipoIngreso = 1 and i.SegmentoID is not null and i.CategoriaID is not null and i.SubcategoriaID is not null and i.ConceptoID is not null and pm.FrecuenciaDictaminada = 7 and (pm.CajaChica = 1 or cu.CuentaID is not null)
      group by i.SegmentoID, s.Nombre, i.CategoriaID, cat.Nombre, i.SubcategoriaID, subcat.Nombre, i.ConceptoID, c.Nombre,
        pm.MontoDictaminado, pm.FrecuenciaDictaminada, pm.CajaChica, pm.DiaLimite, cu.TipoCuentaID, cu.NombreCuenta, cu.RFC, pc.PeriodoID;
    `);

    // vista_egresos_por_categoria
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW vista_egresos_por_categoria AS
      select 
        vistaingresos.CategoriaID AS CategoriaID,
        vistaingresos.NombreCategoria AS NombreCategoria,
        sum(vistaingresos.Monto) AS TotalEgresos
      from vistaingresos
      where vistaingresos.TipoIngreso = 1 and month(vistaingresos.Fecha) = month(curdate()) and year(vistaingresos.Fecha) = year(curdate()) and vistaingresos.Reconciliado = 1
      group by vistaingresos.CategoriaID, vistaingresos.NombreCategoria;
    `);

        await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW vistareconciliaciones AS
      select 
        r.ReconciliacionID AS ReconciliacionID,
        r.Fecha AS Fecha,
        r.Saldo AS Saldo,
        r.CuentaID AS CuentaID,
        c.NombreCuenta AS NombreCuenta,
        t.NombreTipoCuenta AS NombreTipoCuenta
      from reconciliaciones r
      join cuentas c on r.CuentaID = c.CuentaID
      join tipos_cuenta t on c.TipoCuentaID = t.TipoCuentaID;
    `);

    // reporte_ingresos_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW reporte_ingresos_vw AS
      select 
        i.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        i.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        i.SubcategoriaID AS SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        i.ConceptoID AS ConceptoID,
        c.Nombre AS NombreConcepto,
        round(sum(case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Monto else 0 end),2) AS TotalMonto,
        round(sum(case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Piezas else 0 end),2) AS TotalPiezas,
        round(case when count(distinct case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end) > 1 
          then (to_days(max(case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end)) - to_days(min(case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end))) / (count(distinct case when i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end) - 1) else 0 end,2) AS FrecuenciaPromedio,
        max(i.Fecha) AS UltimaFecha
      from vistaingresos i
      left join segmentos s on i.SegmentoID = s.SegmentoID
      left join categorias cat on i.CategoriaID = cat.CategoriaID
      left join subcategorias subcat on i.SubcategoriaID = subcat.SubcategoriaID
      left join conceptos c on i.ConceptoID = c.ConceptoID
      left join presupuesto_manual pm on i.SegmentoID = pm.SegmentoID 
        and i.CategoriaID = pm.CategoriaID 
        and i.SubcategoriaID = pm.SubcategoriaID 
        and i.ConceptoID = pm.ConceptoID
      left join cuentas cu on pm.CuentaID = cu.CuentaID
      where i.TipoIngreso = 0 and i.SegmentoID is not null and i.CategoriaID is not null 
        and i.Reconciliado = 1 
        and i.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') 
        and i.Fecha <= last_day(curdate() - interval 1 month)
      group by i.SegmentoID, s.Nombre, i.CategoriaID, cat.Nombre, i.SubcategoriaID, subcat.Nombre, i.ConceptoID, c.Nombre, 
        pm.MontoDictaminado, pm.FrecuenciaDictaminada, pm.CajaChica, pm.DiaLimite, cu.TipoCuentaID, cu.NombreCuenta, cu.RFC
      having TotalMonto > 0 or TotalPiezas > 0 or FrecuenciaPromedio > 0;
    `);

    // egreso_actual_por_segmento_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW egreso_actual_por_segmento_vw AS
      select 
        vi.SegmentoID AS SegmentoID,
        vi.NombreSegmento AS NombreSegmento,
        sum(vi.Monto) AS EgresoActual
      from vistaingresos vi
      where vi.TipoIngreso = 1 
        and vi.Fecha >= date_format(curdate(),'%Y-%m-01') 
        and vi.Fecha <= last_day(curdate()) 
        and vi.Reconciliado = 1
      group by vi.SegmentoID, vi.NombreSegmento;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ingresos_mes_actual_semanales_vw AS
      SELECT 
        sm.inicio_semana AS inicio_semana,
        sm.fin_semana AS fin_semana,
        COALESCE(SUM(er.Monto),0) AS total_monto
      FROM (
        SELECT 
          fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 DAY + INTERVAL n.n WEEK AS inicio_semana,
          LEAST(fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 DAY + INTERVAL n.n WEEK + INTERVAL 6 DAY, fm.fin_mes) AS fin_semana
        FROM (
          SELECT DATE_FORMAT(CURDATE(),'%Y-%m-01') AS inicio_mes, LAST_DAY(CURDATE()) AS fin_mes
        ) fm
        JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) n
        WHERE fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 DAY + INTERVAL n.n WEEK <= fm.fin_mes

        UNION ALL

        SELECT fm.inicio_mes AS inicio_semana,
              fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 - 1 DAY AS fin_semana
        FROM (SELECT DATE_FORMAT(CURDATE(),'%Y-%m-01') AS inicio_mes, LAST_DAY(CURDATE()) AS fin_mes) fm
        WHERE WEEKDAY(fm.inicio_mes) <> 0
      ) sm
      LEFT JOIN (
        SELECT i.Monto AS Monto, i.Fecha AS Fecha
        FROM ingresos i
        WHERE i.Reconciliado = 1 AND i.TipoIngreso = 0
          AND i.Fecha BETWEEN DATE_FORMAT(CURDATE(),'%Y-%m-01') AND LAST_DAY(CURDATE())
      ) er ON er.Fecha BETWEEN sm.inicio_semana AND sm.fin_semana
      GROUP BY sm.inicio_semana, sm.fin_semana
      ORDER BY sm.inicio_semana;
    `);

    // reporte_gastos_semanales_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW reporte_gastos_semanales_vw AS
      select 
        i.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        i.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        i.SubcategoriaID AS SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        i.ConceptoID AS ConceptoID,
        c.Nombre AS NombreConcepto,
        round(avg(case when i.Fecha >= last_day(curdate() - interval 1 month) + interval 1 day - interval 1 month 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Monto else NULL end),2) AS PromedioMonto,
        round(avg(case when i.Fecha >= last_day(curdate() - interval 1 month) + interval 1 day - interval 1 month 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Piezas else NULL end),2) AS PromedioPiezas,
        round(case when count(distinct case when i.Fecha >= last_day(curdate() - interval 1 month) + interval 1 day - interval 1 month 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end) > 1
          then (to_days(max(case when i.Fecha >= last_day(curdate() - interval 1 month) + interval 1 day - interval 1 month 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end)) 
          - to_days(min(case when i.Fecha >= last_day(curdate() - interval 1 month) + interval 1 day - interval 1 month 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end)))
          / (count(distinct case when i.Fecha >= last_day(curdate() - interval 1 month) + interval 1 day - interval 1 month 
          and i.Fecha <= last_day(curdate() - interval 1 month) then i.Fecha else NULL end) - 1) else 0 end,2) AS FrecuenciaPromedio,
        max(i.Fecha) AS UltimaFecha,
        pm.MontoDictaminado AS MontoDictaminado,
        pm.FrecuenciaDictaminada AS FrecuenciaDictaminada,
        case when gs.CajaChica = 1 then 1 else pm.CajaChica end AS CajaChica,
        pm.DiaLimite AS DiaLimite,
        case when gs.CajaChica = 1 then NULL else coalesce(gs.CuentaID, cu.CuentaID) end AS CuentaID,
        cu.TipoCuentaID AS TipoCuentaID,
        coalesce((select cu2.NombreCuenta from cuentas cu2 where cu2.CuentaID = gs.CuentaID limit 1), cu.NombreCuenta) AS NombreCuenta,
        cu.RFC AS RFC,
        pc.PeriodoID AS PeriodoID,
        concat(date_format(pc.FechaInicio,'%Y-%m-%d'),' al ',date_format(pc.FechaFin,'%Y-%m-%d')) AS PeriodoCongelado
      from vistaingresos i
      left join segmentos s on i.SegmentoID = s.SegmentoID
      left join categorias cat on i.CategoriaID = cat.CategoriaID
      left join subcategorias subcat on i.SubcategoriaID = subcat.SubcategoriaID
      left join conceptos c on i.ConceptoID = c.ConceptoID
      left join presupuesto_manual pm on i.SegmentoID = pm.SegmentoID and i.CategoriaID = pm.CategoriaID 
        and i.SubcategoriaID = pm.SubcategoriaID and i.ConceptoID = pm.ConceptoID
      left join cuentas cu on pm.CuentaID = cu.CuentaID
      left join periodos_congelados pc on pc.FechaInicio <= last_day(curdate() - interval 1 month) 
        and pc.FechaFin >= date_format(curdate() - interval 1 month,'%Y-%m-01')
      left join gastos_semanales_mensuales_cuentas gs on i.SegmentoID = gs.SegmentoID and i.CategoriaID = gs.CategoriaID 
        and i.SubcategoriaID = gs.SubcategoriaID and i.ConceptoID = gs.ConceptoID and pc.PeriodoID = gs.PeriodoID
      where i.TipoIngreso = 1 and i.SegmentoID is not null and i.CategoriaID is not null and i.SubcategoriaID is not null 
        and i.ConceptoID is not null and pm.FrecuenciaDictaminada = 7 and (pm.CajaChica = 1 or cu.CuentaID is not null)
      group by i.SegmentoID, s.Nombre, i.CategoriaID, cat.Nombre, i.SubcategoriaID, subcat.Nombre, i.ConceptoID, c.Nombre,
        pm.MontoDictaminado, pm.FrecuenciaDictaminada, pm.CajaChica, pm.DiaLimite, cu.TipoCuentaID, cu.NombreCuenta, cu.RFC, pc.PeriodoID
      having PromedioMonto is not null or PromedioPiezas is not null or FrecuenciaPromedio > 0;
    `);

    // egreso_mes_pasado_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW egreso_mes_pasado_vw AS
      select sum(ingresos.Monto) AS EgresoMesPasado
      from ingresos
      where ingresos.TipoIngreso = 1 
        and ingresos.Fecha >= date_format(curdate() - interval 1 month,'%Y-%m-01') 
        and ingresos.Fecha <= last_day(curdate() - interval 1 month)
        and ingresos.Reconciliado = 1;
    `);

    // reporte_mes_actual_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW reporte_mes_actual_vw AS
      select 
        i.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        i.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        i.SubcategoriaID AS SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        i.ConceptoID AS ConceptoID,
        c.Nombre AS NombreConcepto,
        pm.MontoDictaminado AS MontoDictaminado,
        pm.FrecuenciaDictaminada AS FrecuenciaDictaminada,
        coalesce(sum(case when month(i.Fecha) = month(curdate()) and year(i.Fecha) = year(curdate()) then i.Monto end),0) AS MontoTotal,
        coalesce(sum(case when month(i.Fecha) = month(curdate()) and year(i.Fecha) = year(curdate()) then i.Piezas end),0) AS PiezasTotal,
        pm.MontoDictaminado - coalesce(sum(case when month(i.Fecha) = month(curdate()) and year(i.Fecha) = year(curdate()) then i.Monto end),0) AS DesfaceMonto,
        round(coalesce(sum(case when month(i.Fecha) = month(curdate()) and year(i.Fecha) = year(curdate()) then i.Monto end),0) / pm.MontoDictaminado * 100,2) AS PresupuestoPorcentaje,
        round(coalesce(sum(case when month(i.Fecha) = month(curdate()) and year(i.Fecha) = year(curdate()) then i.Monto end),0) / pm.MontoDictaminado * 100 - 100,2) AS DesfacePorcentaje,
        round(avg(case when i.Fecha >= curdate() - interval 8 week then i.Monto else NULL end),2) AS PromedioSemanas,
        (select max(v.Fecha) from vistaingresos v 
          where v.SegmentoID = i.SegmentoID and v.CategoriaID = i.CategoriaID 
            and v.SubcategoriaID = i.SubcategoriaID and v.ConceptoID = i.ConceptoID) AS UltimaFecha,
        pm.Observaciones AS Observaciones
      from vistaingresos i
      left join segmentos s on i.SegmentoID = s.SegmentoID
      left join categorias cat on i.CategoriaID = cat.CategoriaID
      left join subcategorias subcat on i.SubcategoriaID = subcat.SubcategoriaID
      left join conceptos c on i.ConceptoID = c.ConceptoID
      left join presupuesto_manual pm on i.SegmentoID = pm.SegmentoID and i.CategoriaID = pm.CategoriaID 
        and i.SubcategoriaID = pm.SubcategoriaID and i.ConceptoID = pm.ConceptoID
      where i.TipoIngreso = 1 and i.SegmentoID is not null and i.CategoriaID is not null 
        and i.SubcategoriaID is not null and i.ConceptoID is not null and pm.MontoDictaminado is not null 
        and (pm.FrecuenciaDictaminada = -1 and month((select max(v.Fecha) from vistaingresos v 
          where v.SegmentoID = i.SegmentoID and v.CategoriaID = i.CategoriaID and v.SubcategoriaID = i.SubcategoriaID 
            and v.ConceptoID = i.ConceptoID)) = month(curdate()) 
          and year((select max(v.Fecha) from vistaingresos v 
          where v.SegmentoID = i.SegmentoID and v.CategoriaID = i.CategoriaID and v.SubcategoriaID = i.SubcategoriaID 
            and v.ConceptoID = i.ConceptoID)) = year(curdate()) 
          or pm.FrecuenciaDictaminada = 7 
          or pm.FrecuenciaDictaminada > 7 and (select max(v.Fecha) from vistaingresos v 
            where v.SegmentoID = i.SegmentoID and v.CategoriaID = i.CategoriaID and v.SubcategoriaID = i.SubcategoriaID 
              and v.ConceptoID = i.ConceptoID) + interval pm.FrecuenciaDictaminada day 
            between date_format(curdate(),'%Y-%m-01') and last_day(curdate()))
      group by i.SegmentoID, s.Nombre, i.CategoriaID, cat.Nombre, i.SubcategoriaID, subcat.Nombre, i.ConceptoID, c.Nombre, 
        pm.MontoDictaminado, pm.FrecuenciaDictaminada;
    `);

        await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW egreso_actual_por_segmento_categoria_subcategoria_concepto_vw AS
      SELECT 
        vi.SegmentoID AS SegmentoID,
        vi.NombreSegmento AS NombreSegmento,
        vi.CategoriaID AS CategoriaID,
        vi.NombreCategoria AS NombreCategoria,
        vi.SubcategoriaID AS SubcategoriaID,
        vi.NombreSubcategoria AS NombreSubcategoria,
        vi.ConceptoID AS ConceptoID,
        vi.NombreConcepto AS NombreConcepto,
        SUM(vi.Monto) AS EgresoActual
      FROM vistaingresos vi
      WHERE vi.TipoIngreso = 1
        AND vi.Fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND vi.Fecha <= LAST_DAY(CURDATE())
        AND vi.Reconciliado = 1
      GROUP BY 
        vi.SegmentoID,
        vi.NombreSegmento,
        vi.CategoriaID,
        vi.NombreCategoria,
        vi.SubcategoriaID,
        vi.NombreSubcategoria,
        vi.ConceptoID,
        vi.NombreConcepto;
    `);

    // Vista: proveedores_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW proveedores_vw AS
      SELECT 
        p.ProveedorID AS ProveedorID,
        p.Proveedor AS Proveedor,
        p.CategoriaID AS CategoriaID,
        p.CostoPorPieza AS CostoPorPieza,
        cat.Nombre AS NombreCategoria,
        p.SubcategoriaID AS SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        p.Estatus AS Estatus,
        p.FechaRegistro AS FechaRegistro,
        p.Rentabilidad AS Rentabilidad,
        p.RentabilidadCostoPeriodo AS RentabilidadCostoPeriodo
      FROM proveedores p
      LEFT JOIN categorias cat ON p.CategoriaID = cat.CategoriaID
      LEFT JOIN subcategorias subcat ON p.SubcategoriaID = subcat.SubcategoriaID;
    `);

    // Vista: utilidades_netas_mensuales_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW utilidades_netas_mensuales_vw AS
      SELECT 
        datos.Anio AS Anio,
        datos.MesNumero AS MesNumero,
        datos.TotalIngresos AS TotalIngresos,
        datos.TotalEgresos AS TotalEgresos,
        datos.TotalIngresos - datos.TotalEgresos AS UtilidadNeta
      FROM (
        SELECT 
          i.Anio AS Anio,
          i.MesNumero AS MesNumero,
          i.IngresoTotal AS TotalIngresos,
          COALESCE(e.EgresoTotal, 0) AS TotalEgresos
        FROM ingresos_totales_vw i
        LEFT JOIN egresos_totales_vw e 
          ON i.Anio = e.Anio AND i.MesNumero = e.MesNumero
        UNION ALL
        SELECT 
          e.Anio AS Anio,
          e.MesNumero AS MesNumero,
          COALESCE(i.IngresoTotal, 0) AS TotalIngresos,
          e.EgresoTotal AS TotalEgresos
        FROM egresos_totales_vw e
        LEFT JOIN ingresos_totales_vw i
          ON e.Anio = i.Anio AND e.MesNumero = i.MesNumero
      ) datos
      ORDER BY datos.Anio, datos.MesNumero DESC;
    `);

    // Vista: gastos_presupuesto_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW gastos_presupuesto_vw AS
      SELECT 
        gp.GastoID AS GastoID,
        gp.FechaPreautorizada AS FechaPreautorizada,
        gp.Concepto AS Concepto,
        gp.Monto AS Monto,
        gp.ProveedorID AS ProveedorID,
        p.Proveedor AS NombreProveedor,
        gp.SegmentoID AS SegmentoID,
        s.Nombre AS NombreSegmento,
        gp.EstatusPresupuestoID AS EstatusPresupuestoID,
        ep.Nombre AS Estatus,
        gp.CuentaID AS CuentaID,
        c.TipoCuentaID AS TipoCuentaID,
        tc.NombreTipoCuenta AS TipoCuenta,
        c.NombreCuenta AS NombreCuenta,
        c.RFC AS RFC,
        gp.Fecha AS Fecha,
        gp.CategoriaID AS CategoriaID,
        cat.Nombre AS NombreCategoria,
        gp.SubcategoriaID AS SubcategoriaID,
        sub.Nombre AS NombreSubcategoria,
        gp.ConceptoID AS ConceptoID,
        con.Nombre AS NombreConcepto
      FROM gastos_presupuesto gp
      LEFT JOIN proveedores p ON gp.ProveedorID = p.ProveedorID
      LEFT JOIN segmentos s ON gp.SegmentoID = s.SegmentoID
      LEFT JOIN estatuspresupuesto ep ON gp.EstatusPresupuestoID = ep.EstatusPresupuestoID
      LEFT JOIN cuentas c ON gp.CuentaID = c.CuentaID
      LEFT JOIN tipos_cuenta tc ON c.TipoCuentaID = tc.TipoCuentaID
      LEFT JOIN categorias cat ON gp.CategoriaID = cat.CategoriaID
      LEFT JOIN subcategorias sub ON gp.SubcategoriaID = sub.SubcategoriaID
      LEFT JOIN conceptos con ON gp.ConceptoID = con.ConceptoID;
    `);

    // Vista: reporte_gastos_periodicos_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW reporte_gastos_periodicos_vw AS
      SELECT 
        subquery.SegmentoID,
        subquery.NombreSegmento,
        subquery.CategoriaID,
        subquery.NombreCategoria,
        subquery.SubcategoriaID,
        subquery.NombreSubcategoria,
        subquery.ConceptoID,
        subquery.NombreConcepto,
        subquery.MontoDictaminado,
        subquery.FrecuenciaDictaminada,
        subquery.CuentaID,
        subquery.TipoCuentaID,
        subquery.NombreCuenta,
        subquery.CajaChica,
        subquery.DiaLimite,
        subquery.PromedioMonto,
        subquery.PromedioPiezas,
        subquery.FrecuenciaPromedio,
        subquery.UltimaFecha,
        subquery.FechaSiguienteGasto,
        subquery.DiasPendientes,
        subquery.PeriodoID,
        subquery.Guardado,
        subquery.CuentaID_Actualizado
      FROM (
        SELECT 
          pm.SegmentoID,
          s.Nombre AS NombreSegmento,
          pm.CategoriaID,
          cat.Nombre AS NombreCategoria,
          pm.SubcategoriaID,
          subcat.Nombre AS NombreSubcategoria,
          pm.ConceptoID,
          c.Nombre AS NombreConcepto,
          pm.MontoDictaminado,
          pm.FrecuenciaDictaminada,
          CASE WHEN gfmc.CuentaID IS NOT NULL THEN gfmc.CuentaID
               ELSE CASE WHEN pm.CajaChica = 1 THEN NULL ELSE pm.CuentaID END
          END AS CuentaID,
          cu.TipoCuentaID,
          COALESCE(
            (SELECT cu2.NombreCuenta FROM cuentas cu2 WHERE cu2.CuentaID = COALESCE(gfmc.CuentaID, pm.CuentaID) LIMIT 1),
            cu.NombreCuenta
          ) AS NombreCuenta,
          CASE WHEN gfmc.CajaChica = 1 THEN 1
               WHEN gfmc.CajaChica = 0 THEN 0
               ELSE COALESCE(pm.CajaChica,0) END AS CajaChica,
          pm.DiaLimite,
          pv.PromedioMonto,
          pv.PromedioPiezas,
          pv.FrecuenciaPromedio,
          pv.UltimaFecha,
          pv.UltimaFecha + INTERVAL pm.FrecuenciaDictaminada DAY AS FechaSiguienteGasto,
          CASE WHEN pv.UltimaFecha IS NOT NULL THEN TO_DAYS(pv.UltimaFecha + INTERVAL pm.FrecuenciaDictaminada DAY) - TO_DAYS(CURDATE()) ELSE NULL END AS DiasPendientes,
          CASE WHEN gpf.GastoFrecuenciaID IS NOT NULL THEN gpf.PeriodoID ELSE COALESCE(pc.PeriodoID,0) END AS PeriodoID,
          CASE WHEN gpf.GastoFrecuenciaID IS NOT NULL THEN 1 ELSE 0 END AS Guardado,
          CASE WHEN pm.CajaChica = 1 THEN NULL ELSE pm.CuentaID END AS CuentaID_Actualizado
        FROM presupuesto_manual pm
        LEFT JOIN presupuesto_vw pv
          ON pm.SegmentoID = pv.SegmentoID AND pm.CategoriaID = pv.CategoriaID
          AND pm.SubcategoriaID = pv.SubcategoriaID AND pm.ConceptoID = pv.ConceptoID
        LEFT JOIN segmentos s ON pm.SegmentoID = s.SegmentoID
        LEFT JOIN categorias cat ON pm.CategoriaID = cat.CategoriaID
        LEFT JOIN subcategorias subcat ON pm.SubcategoriaID = subcat.SubcategoriaID
        LEFT JOIN conceptos c ON pm.ConceptoID = c.ConceptoID
        LEFT JOIN cuentas cu ON pm.CuentaID = cu.CuentaID
        LEFT JOIN periodos_congelados pc
          ON pv.UltimaFecha + INTERVAL pm.FrecuenciaDictaminada DAY
             BETWEEN pc.FechaInicio AND pc.FechaFin
        LEFT JOIN gastos_presupuesto_frecuencia gpf
          ON pm.SegmentoID = gpf.SegmentoID AND pm.CategoriaID = gpf.CategoriaID
             AND pm.SubcategoriaID = gpf.SubcategoriaID AND pm.ConceptoID = gpf.ConceptoID
             AND pv.UltimaFecha = gpf.UltimaFecha
        LEFT JOIN gastos_frecuencia_mensuales_cuentas gfmc
          ON pm.SegmentoID = gfmc.SegmentoID AND pm.CategoriaID = gfmc.CategoriaID
             AND pm.SubcategoriaID = gfmc.SubcategoriaID AND pm.ConceptoID = gfmc.ConceptoID
             AND gfmc.PeriodoID = COALESCE(gpf.PeriodoID, pc.PeriodoID)
      ) subquery
      WHERE subquery.UltimaFecha IS NOT NULL
        AND subquery.FrecuenciaDictaminada BETWEEN 14 AND 180
        AND (subquery.NombreCuenta IS NOT NULL OR subquery.CajaChica = 1)
        AND subquery.Guardado = 1
        AND (subquery.UltimaFecha BETWEEN DATE_FORMAT(LAST_DAY(CURDATE() - INTERVAL 1 MONTH) + INTERVAL 1 DAY - INTERVAL 1 MONTH,'%Y-%m-01')
                                    AND LAST_DAY(CURDATE() - INTERVAL 1 MONTH)
             OR subquery.UltimaFecha + INTERVAL -subquery.FrecuenciaDictaminada DAY
                BETWEEN DATE_FORMAT(LAST_DAY(CURDATE() - INTERVAL 1 MONTH) + INTERVAL 1 DAY - INTERVAL 1 MONTH,'%Y-%m-01')
                AND LAST_DAY(CURDATE() - INTERVAL 1 MONTH)
        );
    `);



    // Vista: usuarios_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW usuarios_vw AS
      SELECT 
        u.userId,
        u.fullName,
        u.phone,
        u.email,
        u.isAdmin,
        u.password,
        u.RolID,
        r.NombreRol
      FROM usuarios u
      LEFT JOIN roles r ON u.RolID = r.RolID;
    `);

        await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW egresos_mes_actual_semanales_vw AS
      SELECT 
        sm.inicio_semana AS inicio_semana,
        sm.fin_semana AS fin_semana,
        COALESCE(SUM(er.Monto),0) AS total_monto
      FROM (
        SELECT 
          fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) % 7 DAY + INTERVAL n.n WEEK AS inicio_semana,
          LEAST(fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) % 7 DAY + INTERVAL n.n WEEK + INTERVAL 6 DAY, fm.fin_mes) AS fin_semana
        FROM (
          SELECT DATE_FORMAT(CURDATE(),'%Y-%m-01') AS inicio_mes,
                 LAST_DAY(CURDATE()) AS fin_mes
        ) fm
        JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) n
        WHERE fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) % 7 DAY + INTERVAL n.n WEEK <= fm.fin_mes
        UNION ALL
        SELECT fm.inicio_mes AS inicio_semana,
               fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) % 7 - 1 DAY AS fin_semana
        FROM (SELECT DATE_FORMAT(CURDATE(),'%Y-%m-01') AS inicio_mes, LAST_DAY(CURDATE()) AS fin_mes) fm
        WHERE WEEKDAY(fm.inicio_mes) <> 0
      ) sm
      LEFT JOIN (
        SELECT i.Monto, i.Fecha
        FROM ingresos i
        WHERE i.Reconciliado = 1 AND i.TipoIngreso = 1
          AND i.Fecha BETWEEN DATE_FORMAT(CURDATE(),'%Y-%m-01') AND LAST_DAY(CURDATE())
      ) er
      ON er.Fecha BETWEEN sm.inicio_semana AND sm.fin_semana
      GROUP BY sm.inicio_semana, sm.fin_semana
      ORDER BY sm.inicio_semana;
    `);

    // Vista: egreso_actual_por_observaciones_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW egreso_actual_por_observaciones_vw AS
      SELECT 
        vi.SegmentoID,
        vi.NombreSegmento,
        vi.CategoriaID,
        vi.NombreCategoria,
        vi.SubcategoriaID,
        vi.NombreSubcategoria,
        vi.ConceptoID,
        vi.NombreConcepto,
        vi.ObservacionesDifConciliacion AS Observaciones,
        vi.Fecha,
        SUM(vi.Monto) AS EgresoActual
      FROM vistaingresos vi
      WHERE vi.TipoIngreso = 1
        AND vi.Fecha >= DATE_FORMAT(CURDATE(),'%Y-%m-01')
        AND vi.Fecha <= LAST_DAY(CURDATE())
        AND vi.Reconciliado = 1
      GROUP BY 
        vi.SegmentoID, vi.NombreSegmento,
        vi.CategoriaID, vi.NombreCategoria,
        vi.SubcategoriaID, vi.NombreSubcategoria,
        vi.ConceptoID, vi.NombreConcepto,
        vi.ObservacionesDifConciliacion, vi.Fecha;
    `);

    // Vista: transferencias_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW transferencias_vw AS
      SELECT 
        t.TransferenciaID,
        t.CuentaEnviaID,
        c1.TipoCuentaID AS EnviaTipoCuentaID,
        c1.NombreCuenta AS EnviaNombreCuenta,
        c1.RFC AS EnviaRFC,
        t.CuentaRecibeID,
        c2.TipoCuentaID AS RecibeTipoCuentaID,
        c2.NombreCuenta AS RecibeNombreCuenta,
        c2.RFC AS RecibeRFC,
        t.Descripcion,
        t.Monto,
        t.Fecha
      FROM transferencias t
      JOIN cuentas c1 ON t.CuentaEnviaID = c1.CuentaID
      JOIN cuentas c2 ON t.CuentaRecibeID = c2.CuentaID;
    `);

    // Vista: presupuesto_semanal_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW presupuesto_semanal_vw AS
      SELECT 
        p.PresupuestoID,
        p.SegmentoID,
        s.Nombre AS SegmentoNombre,
        p.CategoriaID,
        c.Nombre AS CategoriaNombre,
        p.FechaInicio,
        p.FechaFin,
        p.Monto AS PresupuestoPlaneado,
        (SELECT IFNULL(SUM(i1.Monto),0)
         FROM ingresos i1
         WHERE i1.SegmentoID = p.SegmentoID
           AND i1.CategoriaID = p.CategoriaID
           AND i1.TipoIngreso = 1
           AND i1.Reconciliado = 1
           AND i1.FechaConciliacion BETWEEN p.FechaInicio AND p.FechaFin) AS GastoReal,
        i.CuentaID,
        cu.NombreCuenta,
        IFNULL(SUM(i.Monto),0) AS GastoRealPorCuenta
      FROM presupuesto_semanal p
      JOIN segmentos s ON p.SegmentoID = s.SegmentoID
      JOIN categorias c ON p.CategoriaID = c.CategoriaID
      LEFT JOIN ingresos i
        ON i.SegmentoID = p.SegmentoID
       AND i.CategoriaID = p.CategoriaID
       AND i.TipoIngreso = 1
       AND i.Reconciliado = 1
       AND i.FechaConciliacion BETWEEN p.FechaInicio AND p.FechaFin
      LEFT JOIN cuentas cu ON i.CuentaID = cu.CuentaID
      GROUP BY 
        p.PresupuestoID, p.SegmentoID, s.Nombre,
        p.CategoriaID, c.Nombre, p.FechaInicio, p.FechaFin,
        p.Monto, i.CuentaID, cu.NombreCuenta;
    `);

        // ingreso_mes_pasado_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ingreso_mes_pasado_vw AS
      SELECT SUM(ingresos.Monto) AS IngresoMesPasado
      FROM ingresos
      WHERE TipoIngreso = 0
        AND Fecha >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH,'%Y-%m-01')
        AND Fecha <= LAST_DAY(CURDATE() - INTERVAL 1 MONTH)
        AND Reconciliado = 1;
    `);

    // vista_periodos_congelados
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW vista_periodos_congelados AS
      SELECT PeriodoID, FechaInicio, FechaFin, FechaCongelacion
      FROM periodos_congelados
      WHERE (YEAR(FechaInicio) = YEAR(CURDATE()) AND MONTH(FechaInicio) = MONTH(CURDATE()))
         OR (YEAR(FechaFin) = YEAR(CURDATE()) AND MONTH(FechaFin) = MONTH(CURDATE()))
         OR (YEAR(FechaInicio) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(FechaInicio) = MONTH(CURDATE() - INTERVAL 1 MONTH))
         OR (YEAR(FechaFin) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(FechaFin) = MONTH(CURDATE() - INTERVAL 1 MONTH));
    `);

    // ingreso_actual_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ingreso_actual_vw AS
      SELECT SUM(Monto) AS IngresoActual
      FROM ingresos
      WHERE TipoIngreso = 0
        AND Fecha >= DATE_FORMAT(CURDATE(),'%Y-%m-01')
        AND Fecha <= LAST_DAY(CURDATE())
        AND Reconciliado = 1;
    `);

    // resumen_presupuesto_segmentos_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW resumen_presupuesto_segmentos_vw AS
      SELECT 
        s.SegmentoID,
        s.NombreSegmento,
        COALESCE(SUM(gms.MontoDictaminado),0)
          + COALESCE(SUM(gmf.MontoDictaminado),0)
          + COALESCE(SUM(gp.Monto),0) AS MontoEsperado,
        COALESCE(ea.EgresoActual,0) AS MontoActual
      FROM (
        SELECT SegmentoID, NombreSegmento FROM gastos_mensuales_semanales_vw
        UNION
        SELECT SegmentoID, NombreSegmento 
        FROM gastos_mensuales_por_frecuencia_vw
        WHERE Guardado = 1
          AND FechaSiguienteGasto BETWEEN DATE_FORMAT(CURDATE(),'%Y-%m-01') AND LAST_DAY(CURDATE())
        UNION
        SELECT SegmentoID, NombreSegmento 
        FROM gastos_presupuesto_vw
        WHERE EstatusPresupuestoID = 1
          AND Fecha BETWEEN DATE_FORMAT(CURDATE(),'%Y-%m-01') AND LAST_DAY(CURDATE())
        UNION
        SELECT SegmentoID, NombreSegmento
        FROM egreso_actual_por_segmento_vw
      ) s
      LEFT JOIN gastos_mensuales_semanales_vw gms ON s.SegmentoID = gms.SegmentoID
      LEFT JOIN gastos_mensuales_por_frecuencia_vw gmf
        ON s.SegmentoID = gmf.SegmentoID
       AND gmf.Guardado = 1
       AND gmf.FechaSiguienteGasto BETWEEN DATE_FORMAT(CURDATE(),'%Y-%m-01') AND LAST_DAY(CURDATE())
      LEFT JOIN gastos_presupuesto_vw gp
        ON s.SegmentoID = gp.SegmentoID
       AND gp.EstatusPresupuestoID = 1
       AND gp.Fecha BETWEEN DATE_FORMAT(CURDATE(),'%Y-%m-01') AND LAST_DAY(CURDATE())
      LEFT JOIN egreso_actual_por_segmento_vw ea
        ON s.SegmentoID = ea.SegmentoID
      GROUP BY s.SegmentoID, s.NombreSegmento, ea.EgresoActual;
    `);

        // egreso_actual_por_segmento_y_categoria_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW egreso_actual_por_segmento_y_categoria_vw AS
      SELECT 
        vi.SegmentoID AS SegmentoID,
        vi.NombreSegmento AS NombreSegmento,
        vi.CategoriaID AS CategoriaID,
        vi.NombreCategoria AS NombreCategoria,
        SUM(vi.Monto) AS EgresoActual
      FROM vistaingresos vi
      WHERE vi.TipoIngreso = 1
        AND vi.Fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND vi.Fecha <= LAST_DAY(CURDATE())
        AND vi.Reconciliado = 1
      GROUP BY vi.SegmentoID, vi.NombreSegmento, vi.CategoriaID, vi.NombreCategoria;
    `);

    // egreso_actual_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW egreso_actual_vw AS
      SELECT SUM(ingresos.Monto) AS EgresoActual
      FROM ingresos
      WHERE ingresos.TipoIngreso = 1
        AND ingresos.Fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND ingresos.Fecha <= LAST_DAY(CURDATE())
        AND ingresos.Reconciliado = 1;
    `);


    // ingresos_mensuales_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ingresos_mensuales_vw AS
      SELECT 
        i.IngresoID,
        i.Fecha,
        i.ConceptoID,
        c.Nombre AS NombreConcepto,
        i.Descripcion,
        i.ProveedorID,
        p.Proveedor AS Proveedor,
        p.Estatus AS ProveedorEstatus,
        i.Piezas,
        i.Monto,
        i.Saldo,
        i.Comprobante,
        i.SegmentoID,
        s.Nombre AS NombreSegmento,
        i.CategoriaID,
        cat.Nombre AS NombreCategoria,
        i.SubcategoriaID,
        subcat.Nombre AS NombreSubcategoria,
        i.EstatusComprobacionID,
        est.Descripcion AS NombreEstatus,
        i.FechaAutorizacion,
        i.UsuarioAutorizaID,
        ua.fullName AS NombreUsuarioAutoriza,
        i.UsuarioRecibeID,
        ur.fullName AS NombreUsuarioRecibe,
        i.FechaConciliacion,
        i.ObservacionesDifConciliacion,
        cu.TipoCuentaID,
        cu.CuentaID,
        tc.NombreTipoCuenta AS TipoCuenta,
        cu.NombreCuenta,
        cu.RFC,
        i.Reconciliado,
        i.TipoIngreso,
        i.ReconciliacionID,
        r.Saldo AS SaldoReconciliacion,
        i.CuentaContable
      FROM ingresos i
      LEFT JOIN conceptos c ON i.ConceptoID = c.ConceptoID
      LEFT JOIN segmentos s ON i.SegmentoID = s.SegmentoID
      LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID
      LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID
      LEFT JOIN estatuscomprobacion est ON i.EstatusComprobacionID = est.EstatusID
      LEFT JOIN usuarios ua ON i.UsuarioAutorizaID = ua.userId
      LEFT JOIN usuarios ur ON i.UsuarioRecibeID = ur.userId
      LEFT JOIN cuentas cu ON i.CuentaID = cu.CuentaID
      LEFT JOIN tipos_cuenta tc ON cu.TipoCuentaID = tc.TipoCuentaID
      LEFT JOIN reconciliaciones r ON i.ReconciliacionID = r.ReconciliacionID
      LEFT JOIN proveedores p ON i.ProveedorID = p.ProveedorID
      WHERE i.Fecha >= DATE_FORMAT(CURDATE(),'%Y-%m-01')
        AND i.Fecha <= LAST_DAY(CURDATE())
        AND i.TipoIngreso = 0
        AND i.CuentaID IS NOT NULL;
    `);

    // egreso_actual_por_segmento_categoria_subcategoria_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW egreso_actual_por_segmento_categoria_subcategoria_vw AS
      SELECT 
        vi.SegmentoID,
        vi.NombreSegmento,
        vi.CategoriaID,
        vi.NombreCategoria,
        vi.SubcategoriaID,
        vi.NombreSubcategoria,
        SUM(vi.Monto) AS EgresoActual
      FROM vistaingresos vi
      WHERE vi.TipoIngreso = 1
        AND vi.Fecha >= DATE_FORMAT(CURDATE(),'%Y-%m-01')
        AND vi.Fecha <= LAST_DAY(CURDATE())
        AND vi.Reconciliado = 1
      GROUP BY vi.SegmentoID, vi.NombreSegmento, vi.CategoriaID, vi.NombreCategoria, vi.SubcategoriaID, vi.NombreSubcategoria;
    `);

    // vista_ingresos_por_categoria
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW vista_ingresos_por_categoria AS
      SELECT 
        vistaingresos.CategoriaID,
        vistaingresos.NombreCategoria,
        SUM(vistaingresos.Monto) AS TotalIngresos
      FROM vistaingresos
      WHERE vistaingresos.TipoIngreso = 0
        AND MONTH(vistaingresos.Fecha) = MONTH(CURDATE())
        AND YEAR(vistaingresos.Fecha) = YEAR(CURDATE())
        AND vistaingresos.Reconciliado = 1
      GROUP BY vistaingresos.CategoriaID, vistaingresos.NombreCategoria;
    `);

    // ingreso_actual_por_segmento_vw
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ingreso_actual_por_segmento_vw AS
      SELECT 
        vi.SegmentoID,
        vi.NombreSegmento,
        SUM(vi.Monto) AS IngresoActual
      FROM vistaingresos vi
      WHERE vi.TipoIngreso = 0
        AND vi.Fecha >= DATE_FORMAT(CURDATE(),'%Y-%m-01')
        AND vi.Fecha <= LAST_DAY(CURDATE())
        AND vi.Reconciliado = 1
      GROUP BY vi.SegmentoID, vi.NombreSegmento;
    `);

  },

  async down(queryInterface, Sequelize) {
    // Se eliminan en orden inverso
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ingresos_mensuales_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS egreso_actual_por_segmento_categoria_subcategoria_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS vista_ingresos_por_categoria;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ingreso_actual_por_segmento_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS egreso_actual_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS egreso_actual_por_segmento_y_categoria_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ingreso_mes_pasado_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS vista_periodos_congelados;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ingreso_actual_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS resumen_presupuesto_segmentos_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS egresos_mes_actual_semanales_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS egreso_actual_por_observaciones_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS transferencias_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS presupuesto_semanal_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS reporte_gastos_periodicos_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS usuarios_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS egreso_actual_por_segmento_categoria_subcategoria_concepto_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS proveedores_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS utilidades_netas_mensuales_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS gastos_presupuesto_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS reporte_mes_actual_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS egreso_mes_pasado_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS reporte_gastos_semanales_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ingresos_mes_actual_semanales_vw;`);  
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS egreso_actual_por_segmento_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS reporte_ingresos_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS vistareconciliaciones;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS vista_egresos_por_categoria;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS gastos_mensuales_semanales_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS reporte_egresos_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS combinaciones_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS gastos_mensuales_por_frecuencia_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS presupuesto_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS egresos_totales_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ingresos_totales_vw;`);
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS vistaingresos;`);
  }
};
