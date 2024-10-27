import { createFeatureSelector } from '@ngrx/store';
import { AnalysisState } from './analysis/analysis.reducer';

export interface State{
    analyis: AnalysisState;
}

export const getAnalysisState = createFeatureSelector<AnalysisState>('analysis');