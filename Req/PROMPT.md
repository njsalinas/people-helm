Analiza toda la carpeta src/ e identifica todos los problemas que impedirían 
un build limpio para deploy en Vercel. 

Para cada archivo:
1. Ejecuta `npx tsc --noEmit` y captura todos los errores
2. Busca imports de módulos inexistentes o mal escritos
3. Detecta tipos incorrectos, `any` implícitos, y variables no usadas
4. Identifica variables de entorno usadas pero no declaradas en los tipos

Luego corrígelos todos en orden de prioridad, verificando con `npm run build` 
al final. No termines hasta que `npm run build` pase sin errores ni warnings.