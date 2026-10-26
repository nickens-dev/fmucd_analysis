// Run inside the Artifact Session presentation callback.
export function build(presentation) {
  const c = { navy: '#142D42', teal: '#007F86', ink: '#192D3B', gray: '#536573', light: '#F1F5F7', white: '#FFFFFF' };
  function text(s, value, x, y, w, h, size = 28, color = c.ink, bold = false) {
    const a = s.shapes.add({ geometry: 'textbox', position: { left: x, top: y, width: w, height: h }, fill: 'none', line: { fill: 'none', width: 0 } });
    a.text = value;
    a.text.style = { fontFamily: 'Arial', fontSize: size, color, bold };
    return a;
  }
  function slide(title, notes, dark = false) {
    const s = presentation.slides.add();
    s.background.fill = dark ? c.navy : c.white;
    text(s, title, 66, 48, 1148, 110, 44, dark ? c.white : c.ink, true);
    text(s, String(presentation.slides.items.length).padStart(2, '0'), 1170, 665, 55, 30, 18, dark ? '#B7CCD7' : c.gray);
    s.speakerNotes.text = notes;
    return s;
  }
  function line(s, t, y, color = c.ink) { text(s, t, 70, y, 1135, 100, 29, color); }
  function table(s, values, y = 175, widths = [760, 380]) {
    const t = s.tables.add({ rows: values.length, columns: values[0].length, left: 70, top: y, width: 1140, height: values.length * 64, values, columnWidths: widths });
    for (let r = 0; r < values.length; r++) for (let col = 0; col < values[0].length; col++) {
      const q = t.getCell(r, col);
      q.fill = r === 0 ? c.navy : r % 2 ? c.light : c.white;
      q.text.style = { fontFamily: 'Arial', fontSize: 25, color: r === 0 ? c.white : c.ink, bold: r === 0 };
    }
    return t;
  }
  let s = slide('Text-derived work families\nfor duration estimation', `Timing: 0:45. I wanted to test whether descriptions could help connect work that has little exact history. This public-data pilot is an analog for a high-mix, low-volume manufacturing problem. Each material or task may be rare, but its description can still resemble other work. I used university maintenance records to explore the method without presenting factory information. The main finding is that the full model improved validation predictions, while compressing text into family labels added little beyond the full feature set. This is a validation study, with final testing still pending. Source: reports/fmucd_analysis_report.md and data/modeling/duration_pilot/validation_scores.csv.`, true);
  text(s, 'FMUCD public maintenance records', 70, 300, 1100, 55, 30, '#B7CCD7');
  text(s, 'Quincy Nickens\nInterview presentation draft, October 2026', 70, 480, 1080, 90, 26, c.white);

  s = slide('The hypothesis', `Timing: 1:05. The manufacturing motivation is uneven material history. Some products recur often, while others appear once. Engineering descriptions offer another way to relate them. I separated the idea into three questions. Do descriptions capture meaningful similarity? Can that similarity produce understandable work families? Do those families improve a prediction that matters? These questions need different evidence. A group of similar equipment descriptions may make sense to a reviewer without implying similar completion times. My goal was to compare the family feature with existing classifications and the original text representation, rather than assume that well-separated clusters would improve the model. This public dataset tests the workflow, but manufacturing performance requires its own evaluation. Source: reports/fmucd_analysis_report.md.`);
  line(s, '1   Similar descriptions may connect rare work', 195);
  line(s, '2   Similar work may form interpretable families', 315);
  line(s, '3   Family labels may improve duration estimates', 435);
  text(s, 'Family quality and predictive value need separate checks', 70, 590, 1120, 50, 26, c.teal, true);

  s = slide('Data and target', `Timing: 1:10. FMUCD contains about 3.73 million records from 12 universities. I removed exact duplicate rows, audited order identifiers, checked descriptions and dates, and separated eligible records from exclusions. About 1.51 million rows remained eligible under the current rules. The training set contains 467,618 distinct task definitions, and about 96.8 percent have one training observation. A task combines a normalized work description with its system and component codes, so this is stricter than counting descriptions alone. I selected recorded WODuration as an initial target and checked it against dates. It measures elapsed days, including possible queue and administrative time. That limits the connection to manufacturing effort. Source: FMUCD V1, https://doi.org/10.17632/cb8d2nsjss.1, CC BY 4.0. Audit: data/clustering/manifest.json and reports/evidence/report_metrics.json.`);
  table(s, [['Measure', 'Count'], ['Raw records', '3.73 million'], ['Eligible records', '1.51 million'], ['Training task definitions', '467,618'], ['Training tasks observed once', '96.8%']]);
  text(s, 'Target: elapsed calendar days, including potential waiting time', 70, 550, 1125, 90, 29, c.teal, true);

  s = slide('Four notebooks and a chronological comparison', `Timing: 1:10. I organized the pipeline into exploration, embedding, clustering, and modeling notebooks. Exploration audits the records, defines task keys, and exports features separately from outcomes. Embedding compares work descriptions alone with descriptions plus classification text. Clustering compares text, numerical task profiles, and their combination. Modeling compares baselines and matched models with and without families. I fit text transformations and clusters using training tasks only. Training orders start and finish before March 25, 2019. Validation starts from March 25 through November 19 and finishes before November 20. Later starts belong to the test period. The completed modeling pilot samples 25,000 training orders and 10,000 validation orders. No completed final-test result is recorded. Source: data/clustering/split_summary.csv and data/modeling/duration_pilot/manifest.json.`);
  table(s, [['Notebook', 'Purpose'], ['Exploration', 'Audit records and prepare datasets'], ['Embedding', 'Represent descriptions numerically'], ['Clustering', 'Compare candidate work families'], ['Modeling', 'Test predictive value against baselines']], 175, [360, 780]);
  text(s, 'Fit on training only\n25,000 training / 10,000 validation orders. Final test pending.', 70, 550, 1135, 95, 27, c.teal, true);

  s = slide('Clustering found structure, with caveats', `Timing: 1:25. The completed text run used word unigram and bigram TF-IDF, 128-dimensional truncated SVD, and normalization. This is a lexical baseline. We have not yet tested a pretrained semantic encoder. The vocabulary and SVD fit used 20,000 training tasks. MiniBatch K-means fit up to 50,000 training tasks, comparing 8, 16, and 32 clusters with two seeds. Context text selected 32 clusters, silhouette 0.279 and cross-seed adjusted Rand index 0.854. Work text alone had lower seed agreement. Aggregate profiles produced high geometric scores, but their largest family held about 40 percent of training tasks and reflected missing building information and maintenance type. Context families closely followed component classifications. Silhouette across different feature spaces does not directly rank operational usefulness. Seed ARI measures repeatability, not expert agreement. Source: data/families/families_review/candidate_scores.csv and reports/evidence/cluster_profiles.csv.`);
  table(s, [['Representation', 'Families', 'Seed ARI'], ['Work description', '32', '0.508'], ['Work + classification text', '32', '0.854'], ['Aggregate task profiles', '16', '0.979'], ['Combined context + aggregates', '32', '0.595']], 170, [700, 220, 220]);
  text(s, 'Context tracks component classes. Aggregates also track missingness.\nStability alone does not establish a useful work family.', 70, 550, 1140, 100, 27, c.teal, true);

  s = slide('The full model improved validation predictions', `Timing: 1:40. I compared five baselines and eighteen fitted candidates: six feature sets with Ridge, a decision tree, and Extra Trees. Optional neural-network fitting was disabled. This chart shows selected validation MSE results in squared days. Lower is better. The median baseline scored about 782, and existing-class Extra Trees scored 693. Full features brought that to 625. Full features include classification codes, 128 text dimensions, building attributes, university, priority, maintenance type, and calendar fields. Adding the text-family label reduced MSE from 624.57 to 622.08, about 0.4 percent. RMSE changed from 24.99 to 24.94 days. The family-only model was worse than the median baseline. The original features contain predictive signal, but this pilot has not established a dependable added benefit from family labels. We used one validation window and sample, with no paired uncertainty estimate. Source: data/modeling/duration_pilot/validation_scores.csv.`);
  s.charts.add('bar', {
    position: { left: 65, top: 165, width: 850, height: 420 },
    categories: ['Median baseline', 'Existing classes', 'Full features', 'Full + family'],
    series: [{ name: 'Validation MSE', values: [781.9437, 693.3498, 624.5721, 622.0774], fill: c.teal, valuesFormatCode: '0.0' }],
    barOptions: { direction: 'bar', grouping: 'clustered' }, hasLegend: false,
    xAxis: { textStyle: { fontSize: 22 } },
    yAxis: { min: 0, max: 900, numberFormatCode: '0', textStyle: { fontSize: 20 } },
    dataLabels: { showValue: true, position: 'outEnd', numberFormatCode: '0.0', textStyle: { fontSize: 22 } }
  });
  text(s, '0.4%', 955, 235, 250, 95, 64, c.teal, true);
  text(s, 'MSE reduction\nfrom adding family', 955, 340, 255, 110, 27);
  text(s, 'MSE in days², lower is better. Fitted comparisons shown use Extra Trees.', 70, 600, 1140, 55, 23, c.gray);

  s = slide('Unseen work and long durations remain difficult', `Timing: 1:05. Overall performance hides important differences. The best candidate had validation R squared about 0.178. For previously seen task definitions, within-slice R squared was 0.255. For unseen tasks it was slightly negative, minus 0.032. Each slice uses its own outcome mean as the R squared reference. This warns that similarity has not yet solved the sparse-history problem that motivated the project. The longest-duration validation group, orders lasting at least 61 days, contained 1,010 of 10,000 orders but contributed about 62.8 percent of squared error. Predictions for that group were low by 44 days on average. Training and validation target distributions also shifted. These results motivate examining the target and error distribution before adding model complexity. Source: data/modeling/duration_pilot/validation_slices.csv and reports/evidence/report_metrics.json.`);
  table(s, [['Validation slice', 'Orders', 'R²'], ['Previously seen tasks', '5,795', '0.255'], ['Previously unseen tasks', '4,205', '−0.032']], 185, [700, 220, 220]);
  text(s, 'Orders lasting at least 61 days contributed 62.8% of squared error', 70, 440, 1130, 90, 33, c.teal, true);
  text(s, 'The best model underestimated that group by 44 days on average', 70, 555, 1130, 70, 27);

  s = slide('What this pilot can establish', `Timing: 0:55. The family label comes from the same text vectors already available to the full model. It adds a summary rather than a new source of information. Limited incremental value is possible even when a grouping is sensible. Equipment similarity also does not guarantee similar elapsed completion time. University and building context can reflect local processes, and aggregate families were sensitive to missing data. The completed experiment used TF-IDF and SVD, so it does not settle whether a semantic encoder would perform better. The current code removes our added Work, System, Subsystem, and Component labels from concatenated text, but the saved runs predate that change. I have not treated cleanup as an improvement without rerunning the comparison. Source: reports/fmucd_analysis_report.md and current data_exp.ipynb.`);
  line(s, 'Families summarize information the full model already receives', 180);
  line(s, 'Equipment similarity may not imply similar elapsed duration', 285);
  line(s, 'Location practices and missing fields can shape the results', 390);
  line(s, 'Semantic embeddings and cleaner text remain untested', 495, c.teal);

  s = slide('The next experiment', `Timing: 0:45. I would hold the split and samples fixed while comparing clean work descriptions, classification descriptions alone, and their combination. I would compare a pretrained sentence encoder with TF-IDF and inspect nearest neighbors for similarity in actual work. I would repeat the target audit for LaborHours, which is closer to manufacturing effort if the records are usable. Rare and unseen task performance should remain central, with repeated chronological windows to assess consistency. After locking the approach using validation evidence, I would evaluate the held-out test once. My conclusion is that the workflow is useful, but family labels need stronger evidence. Manufacturing validation would require authorized descriptions, routings, and actual labor outcomes. Source: reports/fmucd_analysis_report.md, future-work section.`, true);
  line(s, 'Compare clean text with a pretrained semantic encoder', 190, c.white);
  line(s, 'Audit LaborHours as a target closer to work effort', 300, c.white);
  line(s, 'Validate rare and unseen work, then lock the final test', 410, c.white);
  text(s, 'The pilot found predictive signal. The added value of families remains open.', 70, 570, 1130, 90, 30, '#8DD6D6', true);
}
