import Vue from 'vue'
import moment from 'moment-timezone';
import store from '@/store';

import {customCss} from './bootstrapCSS'
import { pathwayCompletedInfoType } from '@/types/Application';


Vue.filter('beautify-date-', function(date){
	enum MonthList {'Jan' = 1, 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'}
	if(date)
		return date.substr(8,2) + ' ' + MonthList[Number(date.substr(5,2))] + ' ' + date.substr(0,4);
	else
		return ''
})

Vue.filter('beautify-date', function(date){
	enum MonthList {'Jan' = 1, 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'}
	if(date)
		return MonthList[Number(date.substr(5,2))] + ' ' +date.substr(8,2) + ' ' +  date.substr(0,4);
	else
		return 'unknown'
})

Vue.filter('beautify-time', function(time){	
	if(time)
		return time.substr(11,2) + ':' +  time.substr(14,2);
	else
		return ''
})

Vue.filter('beautify-date-blank', function(date){
	enum MonthList {'Jan' = 1, 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'}
	if(date)
		return MonthList[Number(date.substr(5,2))] + ' ' +date.substr(8,2) + ' ' +  date.substr(0,4);
	else
		return ' '
})

Vue.filter('beautify-date-weekday', function(date){
	if(date)
		return	moment(date).format('ddd MMM DD, YYYY HH:mm');
	else
		return ''
})

Vue.filter('scrollToLocation', function(locationName){
	if(locationName){
		Vue.nextTick(()=>{
			const el = document.getElementsByName(locationName)
			if(el[0]) el[0].scrollIntoView();
		})
	}
})

Vue.filter('styleTitle',function(title){
	return "<div style='display:inline; color:#29877c'>" + title + "</div>"
})

Vue.filter('getFullName',function(nameObject){
	if (nameObject) {
		return nameObject.first +
			" " +
			nameObject.middle +
			" " +
			nameObject.last;
	} else{
		return " "
	}
})

Vue.filter('getFullAddress',function(nameObject){

	if (nameObject && Object.keys(nameObject).length) {
		return 	(nameObject.street?(nameObject.street +", "):'') +
				(nameObject.city?(nameObject.city +", "):'') +
				(nameObject.state?(nameObject.state +", "):'') +
				(nameObject.country?(nameObject.country +", "):'') +
				(nameObject.postcode);
	} else{
		return " "
	}
})

Vue.filter('getFullContactInfo',function(nameObject){
	const pre = "<div style='display:inline; color:#10669c'>"
	const post = "</div>"
	if (nameObject && Object.keys(nameObject).length) {
		return pre+"Phone: "+post+
			(nameObject.phone? nameObject.phone:' - ') +
			" "+pre+"Email: "+post+
			(nameObject.email? nameObject.email:' - ') +
			" "+pre+"Fax: "+post+
			(nameObject.fax? nameObject.fax:' - ');
	} else{
		return " "
	}
})

Vue.filter('setSurveyProgress', function(survey, currentStep: number, currentPage: number, defaultProgress: number, beforeDestroy: boolean){

	let progress =  defaultProgress;

	if(survey && store.state.Application.steps[currentStep].pages[currentPage].progress)
		progress = survey.isCurrentPageHasErrors? 50 : 100;

	store.commit("Application/setPageProgress", { currentStep: currentStep, currentPage:currentPage, progress:progress });

})

Vue.filter('setProgressForPages', function(currentStep: number, pageNumbers: number[], progress: number){
	for (const page of pageNumbers)
		if(store.state.Application.steps[currentStep].pages[page].progress)
			store.commit("Application/setPageProgress", { currentStep: currentStep, currentPage:page, progress:progress });
})

Vue.filter('getSurveyResults', function(survey, currentStep: number, currentPage: number, optionalArg?){
	const supportingDocumentForm4 = store.state.Application.supportingDocumentForm4
	const index = supportingDocumentForm4.indexOf(currentPage)
	if(index>=0) supportingDocumentForm4.splice(index,1);
	let flagForm4 = false;

	const questionResults: {name:string; value: any; title:string; inputType:string}[] =[];
	for(const question of survey.currentPage.questions){
		
		//console.log(question)

		if(question.isVisible && question.name?.startsWith("parentFileForm4Info")){		
			flagForm4 = true
		}
			
		// if(question.isVisible && question.questionValue!=true){			
		// 	if(survey.data[question.name]){			
		// 		questionResults.push({name:question.name, value: question.questionValue, title:question.title, inputType:question.inputType})
		// 	} else if(question.isRequired ){				
		// 		questionResults.push({name:question.name, value: "", title:question.title, inputType:question.inputType})
				
		// 	}else if(question.name=='extraordinaryExpensesTable' && question.isVisible){			
		// 		questionResults.push({name:question.name, value: optionalArg?optionalArg:'$0', title:question.title, inputType:question.inputType})
		// 	}	
		// }
		// //__specialities
		// else if(question.name=='PartiesHasOtherChilderen' && question.isVisible)
		// 	questionResults.push({name:question.name, value: question.questionValue, title:question.title, inputType:question.inputType})
		
		if(question.isVisible && question.questionValue!=true){			
			if(question.processedTitle == 'I understand'){
				questionResults.push({name:question.name, value: question.questionValue, title:question.otherText, inputType:question.inputType})
			}
			else if(survey.data[question.name]){			
				questionResults.push({name:question.name, value: question.questionValue, title:question.processedTitle, inputType:question.inputType})
			} else if(question.isRequired ){				
				questionResults.push({name:question.name, value: "", title:question.processedTitle, inputType:question.inputType})
				
			}else if(question.name=='extraordinaryExpensesTable' && question.isVisible){			
				questionResults.push({name:question.name, value: optionalArg?optionalArg:'$0', title:question.processedTitle, inputType:question.inputType})
			}	
		}
		//__specialities
		else if(question.name=='PartiesHasOtherChilderen' && question.isVisible)
			questionResults.push({name:question.name, value: question.questionValue, title:question.processedTitle, inputType:question.inputType})
		
	}

	if(optionalArg && optionalArg.name && optionalArg.value && optionalArg.title){	
		questionResults.push(optionalArg)
	}

	if(flagForm4){
		const additionalDocumentsStep = store.state.Application.stPgNo.FLM._StepNo
		const additionalDocumentsPage = store.state.Application.stPgNo.FLM.FlmAdditionalDocuments
		if(store.state.Application.steps[additionalDocumentsStep].pages[additionalDocumentsPage].progress==100)
			Vue.filter('setSurveyProgress')(null, additionalDocumentsStep, additionalDocumentsPage, 50, false);
		supportingDocumentForm4.push(currentPage)
		store.commit("Application/setSupportingDocumentForm4", supportingDocumentForm4);
		store.commit("Application/setCommonStepResults",{data:{'supportingDocumentForm4':supportingDocumentForm4}}); 
	}
	
	Vue.nextTick(()=>{
		Vue.filter('FLMformsRequired')();
	});
	return {data: survey.data, questions:questionResults, pageName:survey.currentPage.title, currentStep: currentStep, currentPage:currentPage}
})

Vue.filter('getPathwayPdfType',function(name){	
	
	if (name == 'protectionOrder')        	return "AAP";
	if (name == 'familyLawMatterForm1') 	return "NTRF";
	if (name == 'familyLawMatter')   		return "FLC";
	if (name == 'caseMgmt')          		return "ACMO";
	if (name == 'priorityParenting') 		return "AXP";
	if (name == 'childReloc')        		return "APRC";
	if (name == 'agreementEnfrc')    		return "AFET";
	
})

Vue.filter('getFullOrderName',function(orderName, specific){
	if (orderName == "protectionOrder" && specific == '') return "Protection Order";
	else if (orderName == "protectionOrder" && specific == 'needPO') return "New Protection Order";
	else if (orderName == "protectionOrder" && specific == 'changePO') return "Change Protection Order";
	else if (orderName == "protectionOrder" && specific == 'terminatePO') return "Terminate Protection Order";
	else if (orderName == "familyLawMatter") return "Family Law Matter";
	else if (orderName == "caseMgmt") return "Case Management";
	else if (orderName == "priorityParenting") return "Priority Parenting Matter";
	else if (orderName == "childReloc") return "Relocation of a Child";
	else if (orderName == "agreementEnfrc") return "Enforcement of Agreements and Court Orders";
	else return "";
})

Vue.filter('translateTypes',function(applicationTypes: string[]) {

	let types = [];

	for (const applicationType of applicationTypes){
		if (applicationType.includes("Protection Order")){
			types.push(applicationType.replace("Protection Order", "FPO"));
		}
		if (applicationType.includes("Family Law Matter")){
			types.push("FLC");
		}
		if (applicationType.includes("Case Management")){
			types.push("ACMO");
		}
		if (applicationType.includes("Priority Parenting Matter")){
			types.push("AXP");
		}
		if (applicationType.includes("Relocation of a Child")){
			types.push("APRC");
		}
		if (applicationType.includes("Enforcement of Agreements and Court Orders")){
			types.push("AFET");
		}
	}

	return types.toString();
})

Vue.filter('FLMform4Required', function(){
	const stepFLMnum = store.state.Application.stPgNo.FLM._StepNo

	const form4Pages = store.state.Application.supportingDocumentForm4
	if(store.state.Application.supportingDocumentForm4?.length>0){
		for(const page of form4Pages){
			if(store.state.Application.steps[stepFLMnum].pages[page].active)
			{
				return true
			}
		}				
	}
	return false
})

Vue.filter('FLMform5Required', function(){
	const stepFLMnum = store.state.Application.stPgNo.FLM._StepNo
	const results = store.state.Application.steps[stepFLMnum].result
	if( results?.flmQuestionnaireSurvey?.data?.includes("guardianOfChild") && 		
		results?.guardianOfChildSurvey?.data?.applicationType?.includes('becomeGuardian') ){
			return true
		}
	else  return false
})

Vue.filter('FLMformsRequired', function(){
	const additionalDocumentsStep = store.state.Application.stPgNo.FLM._StepNo
	const additionalDocumentsPage = store.state.Application.stPgNo.FLM.FlmAdditionalDocuments

	if(Vue.filter('FLMform4Required')() || Vue.filter('FLMform5Required')() ) 
		store.commit("Application/setPageActive", {currentStep: additionalDocumentsStep, currentPage: additionalDocumentsPage, active: true });
	else
		store.commit("Application/setPageActive", {currentStep: additionalDocumentsStep, currentPage: additionalDocumentsPage, active: false });
})

Vue.filter('extractRequiredDocuments', function(questions, type){

	const requiredDocuments: string[] = [];
	const reminderDocuments: string[] = [];

	if(type == 'protectionOrder'){		
	
		if(questions.poQuestionnaireSurvey?.orderType == "changePO"){
			
			requiredDocuments.push("Copy of your existing written agreement(s) or court order(s)")
		
		}else if(questions.poQuestionnaireSurvey?.orderType == "terminatePO"){
		
			requiredDocuments.push("Copy of your existing written agreement(s) or court order(s)")
		
		}else if(questions.poQuestionnaireSurvey?.orderType == "needPO"){
			
			requiredDocuments.push("Any exhibits referenced in your application");
			
			if( questions.poFilingLocationSurvey?.ExistingFamilyCase =="y" ||
			    questions.backgroundSurvey?.existingPOOrders=="y" ||
				questions.backgroundSurvey?.ExistingOrders=="y" 
			){
				requiredDocuments.push("Copy of your existing written agreement(s) or court order(s)");
			}
		}
	}

	if(type == 'familyLawMatter'){	

		if(questions.flmBackgroundSurvey?.existingPOOrders == "y"|| questions.flmBackgroundSurvey?.ExistingOrdersFLM == "y")
		  	requiredDocuments.push("Copy of your existing written agreement(s) or court order(s)");
			
		if(Vue.filter('FLMform4Required')())		
			requiredDocuments.push("Completed <a href='https://www2.gov.bc.ca/assets/gov/law-crime-and-justice/courthouse-services/court-files-records/court-forms/family/pfa713.pdf?forcedownload=true' target='_blank' > Financial Statement Form 4 </a>");

		if( (questions.calculatingChildSupportSurvey?.attachingCalculations == 'y'  &&  questions.flmQuestionnaireSurvey?.includes("childSupport") )
		|| ( questions.calculatingSpousalSupportSurvey?.attachingCalculations== 'y' &&  questions.flmQuestionnaireSurvey?.includes("spousalSupport"))
		)
			requiredDocuments.push("Support calculation");

		if(Vue.filter('FLMform5Required')()){		
			requiredDocuments.push("Completed  <a class='mr-1' href='https://www2.gov.bc.ca/assets/gov/law-crime-and-justice/courthouse-services/court-files-records/court-forms/supreme-family/s-51-consent-child-protection-record-check.pdf?forcedownload=true' target='_blank' > Consent for Child Protection Record Check Form 5 </a> <i> Family Law Act Regulation </i>");
			requiredDocuments.push("Completed  <a class='mr-1' href='https://www2.gov.bc.ca/assets/gov/law-crime-and-justice/courthouse-services/court-files-records/court-forms/family/pfa914.pdf?forcedownload=true' target='_blank' > Request for protection order registry search </a> form");		
		}
	
		//REMINDERS 
	
		if( ( questions.flmQuestionnaireSurvey?.includes("childSupport")   && questions.aboutExistingChildSupportSurvey?.filedWithDirector == "y" )
		  ||( questions.flmQuestionnaireSurvey?.includes("spousalSupport") && questions.existingSpousalSupportOrderAgreementSurvey?.filedWithDirector == "y" )
		  )
			reminderDocuments.push("You must serve a copy of the application on the director of Maintenance Enforcement.")
		
		if( questions.flmQuestionnaireSurvey?.includes("guardianOfChild") &&
			(questions.indigenousAncestryOfChildSurvey?.indigenousAncestry?.includes("Nisg̲a’a") || questions.indigenousAncestryOfChildSurvey?.indigenousAncestry?.includes("Treaty First Nation") )  )
				reminderDocuments.push("You must serve the Nisg̲a’a Lisims Government or the Treaty First Nation to which the child belongs with notice of this application as described in section 208 or 209 of the Family Law Act.")
	}

	if(type == 'priorityParenting'){
		if(questions.ppmBackgroundSurvey?.ExistingOrdersFLM == "y")
			requiredDocuments.push("Copy of your existing written agreement(s) or court order(s)");
	}

	if(type == 'childReloc'){
		if(questions.relocQuestionnaireSurvey?.ExistingParentingArrangements == "y" )
			requiredDocuments.push("Copy of your existing written agreement(s) or court order(s)");
	}

	if(type == 'caseMgmt'){
		if(questions.byConsentSurvey?.giveConsentDirection == "fileForm18")
			requiredDocuments.push("Completed <a target='blank' href='https://www2.gov.bc.ca/assets/gov/law-crime-and-justice/courthouse-services/court-files-records/court-forms/family/pfa739.pdf?forcedownload=true'>Consent Order Form 18</a> form");
	}
		
	store.commit("Application/setRequiredDocumentsByType", {typeOfRequiredDocuments:type, requiredDocuments:{required:requiredDocuments ,reminder:reminderDocuments} });	
	store.commit("Application/setCommonStepResults",{data:{'requiredDocuments':store.state.Application.requiredDocuments}});
	
	return requiredDocuments;
})

Vue.filter('replaceRequiredDocuments', function(){
	const requireDocs = JSON.parse(JSON.stringify(store.state.Application.requiredDocuments));
	const stepFLMnum = store.state.Application.stPgNo.FLM._StepNo

	if(store.state.Application.requiredDocuments['familyLawMatter'] && store.state.Application.requiredDocuments['familyLawMatter'].required){
		requireDocs['familyLawMatter']['required'] = []		
		let caseManagementDocPushed = false
		for(const doc of store.state.Application.requiredDocuments['familyLawMatter'].required){
			if( store.state.Application.steps[stepFLMnum].result?.flmAdditionalDocumentsSurvey?.data?.isFilingAdditionalDocs =='n' &&				
				store.state.Application.steps[stepFLMnum].result?.flmAdditionalDocumentsSurvey?.data?.unableFileForms?.includes(doc)){
					if(!caseManagementDocPushed){
						requireDocs['familyLawMatter']['required'].push("Completed  <a class='mr-1' href='https://www2.gov.bc.ca/assets/gov/law-crime-and-justice/courthouse-services/court-files-records/court-forms/family/pfa718.pdf?forcedownload=true' target='_blank'> Application for Case Management Order Without Notice or Attendance </a> Form 11")
						caseManagementDocPushed = true;
					}
			}
			else
				requireDocs['familyLawMatter']['required'].push(doc)
		}
		
		store.commit("Application/setRequiredDocuments", requireDocs);
	}
})

Vue.filter('surveyChanged', function(type: string) {
	
	const steps = store.state.Application.steps

	const stepPO = store.state.Application.stPgNo.PO
	const stepFLM = store.state.Application.stPgNo.FLM
	const stepPPM = store.state.Application.stPgNo.PPM
	const stepRELOC = store.state.Application.stPgNo.RELOC
	const stepCM = store.state.Application.stPgNo.CM

	const noPOsteps        = [stepFLM._StepNo,              stepPPM._StepNo,              stepRELOC._StepNo]   
	const noPOreviewPages  = [stepFLM.ReviewYourAnswersFLM, stepPPM.ReviewYourAnswersPPM, stepRELOC.ReviewYourAnswersRELOC];
	const noPOpreviewPages = [stepFLM.PreviewFormsFLM,      stepPPM.PreviewFormsPPM,      stepRELOC.PreviewFormsRELOC];

	let step = stepPO._StepNo; 
	let reviewPage = stepPO.ReviewYourAnswers; 
	let previewPage = stepPO.PreviewForms;
	
	if(type == 'protectionOrder'){
		step = stepPO._StepNo; 
		reviewPage = stepPO.ReviewYourAnswers; 
		previewPage = stepPO.PreviewForms;
	}
	else if(type == 'familyLawMatter'){
		step = stepFLM._StepNo; 
		reviewPage = stepFLM.ReviewYourAnswersFLM; 
		previewPage = stepFLM.PreviewFormsFLM;	
	}
	else if(type == 'priorityParenting'){
		step = stepPPM._StepNo; 
		reviewPage = stepPPM.ReviewYourAnswersPPM; 
		previewPage = stepPPM.PreviewFormsPPM;	
	}
	else if(type == 'childReloc'){
		step = stepRELOC._StepNo; 
		reviewPage = stepRELOC.ReviewYourAnswersRELOC; 
		previewPage = stepRELOC.PreviewFormsRELOC;	
	}
	else if(type == 'caseMgmt'){
		step = stepCM._StepNo; 
		reviewPage = stepCM.ReviewYourAnswersCM; 
		previewPage = stepCM.PreviewFormsCM;	
	}

	if(type == 'allExPO'){
        
		let pathwayCompleted = {} as pathwayCompletedInfoType;
		pathwayCompleted = store.state.Application.pathwayCompleted			        
		pathwayCompleted.familyLawMatter = false;        
		pathwayCompleted.caseMgmt = false;       
		pathwayCompleted.priorityParenting = false;       
		pathwayCompleted.childReloc = false;       
		pathwayCompleted.agreementEnfrc = false;		
		store.commit("Application/setPathwayCompletedFull",pathwayCompleted);
		store.commit("Application/setCommonStepResults",{data:{'pathwayCompleted':pathwayCompleted}});            
        store.dispatch("Application/checkAllCompleted")

		for(const inx in noPOsteps){
			const noPOstep = noPOsteps[inx]
			const noPOreviewPage =  noPOreviewPages[inx]
			const noPOpreviewPage = noPOpreviewPages[inx]
			if(steps[noPOstep].pages[noPOreviewPage].progress ==100 ){//if changes, make review page incompelete
				store.commit("Application/setPageProgress", { currentStep: noPOstep, currentPage: noPOreviewPage,  progress: 50 });
				store.commit("Application/setPageActive",   { currentStep: noPOstep, currentPage: noPOpreviewPage, active: false });
			
				if(steps[noPOstep].pages[noPOpreviewPage].progress ==100)store.commit("Application/setPageProgress", { currentStep: noPOstep, currentPage:noPOpreviewPage, progress:50 });
			}
		}

	}else{
		store.dispatch("Application/UpdatePathwayCompleted", {pathway: type, isCompleted: false})
		
		if(steps[step].pages[reviewPage].progress ==100 ){//if changes, make review page incompelete
			store.commit("Application/setPageProgress", { currentStep: step, currentPage:reviewPage, progress:50 });
			store.commit("Application/setPageActive", { currentStep: step, currentPage: previewPage, active: false });
		
			if(steps[step].pages[previewPage].progress ==100)store.commit("Application/setPageProgress", { currentStep: step, currentPage:previewPage, progress:50 });
		}
	}

	const submitStep       = store.state.Application.stPgNo.SUBMIT._StepNo
	const submitTotalPages = (Object.keys(store.state.Application.stPgNo.SUBMIT).length -1)
	store.commit("Application/resetStep", submitStep);
	for (let i=1; i<submitTotalPages; i++) {
		store.commit("Application/setPageActive",   { currentStep: submitStep, currentPage: i, active: false });
		store.commit("Application/setPageProgress", { currentStep: submitStep, currentPage: i, progress:0 });
	}	
})

Vue.filter('printPdf', function(html, pageFooterLeft, pageFooterRight){

	const body = 
		`<!DOCTYPE html>
		<html lang="en">
		<head>		
		<meta charset="UTF-8">
		<title>Family Law Act</title>`+
		`<style>`+
			`@page {
				size: 8.5in 11in !important;
				margin: .7in 0.7in 0.9in 0.7in !important;
				font-size: 10pt !important;			
				@bottom-left {
					content:`+ pageFooterLeft +
					`white-space: pre;
					font-size: 7pt;
					color: #606060;
				}
				@bottom-right {
					content:`+pageFooterRight+` "  Page " counter(page) " of " counter(pages);
					font-size: 7pt;
					color: #606060;
				}
			}`+
			`@media print{
				.new-page{
					page-break-before: always;
					position: relative; top: 8em;
				}
				section{
					page-break-inside: avoid;
				}
				.print-block{
					page-break-inside: avoid;
				}
			}`+ customCss+
			`@page label{font-size: 9pt;}
			.container {				
				padding: 0 !important; 
				margin: 0 !important;				
				width: 100% !important;
				max-width: 680px !important;
				min-width: 680px !important;			
				font-size: 10pt !important;
				font-family: BCSans !important;
				color: #313132 !important;
			}
			`+
			`td.border-dark {border: 1px solid #313132 !important;}`+
			`th.border-dark {border: 1px solid #313132 !important;}`+
			`td.border-top-0{border-top: 0px solid #FFF !important;border-bottom: 1px solid #313132 !important;border-left: 1px solid #313132 !important; border-right: 1px solid #313132 !important;}`+
			`th.border-bottom-0{border-top: 1px solid #313132 !important;border-bottom: 0px solid #FFF !important;border-left: 1px solid #313132 !important; border-right: 1px solid #313132 !important;}`+
			`tr{height: 1.5rem;}`+
			`table.fullsize {table-layout: fixed; width: 100%; margin-top:0.5rem;}`+
			`table.fullsize tr{border:1px solid #313132;}`+
			`table.fullsize td{padding:0 0 0 .5rem; color: #313132;}`+

			`table.compactfullsize {table-layout: fixed; width: 100%; margin-top:0rem;}`+
			`table.compactfullsize tr{border:1px solid #313132;}`+
			`table.compactfullsize td{padding:0 0 0 .5rem; color: #313132;}`+

			`.answer{color: #000; display:inline; font-size:11pt;}`+
			`.answerbox{color: #000; font-size:11pt; display:block; text-indent:0px; margin:0.5rem 0 0.5rem 0 !important;}`+
    		`.uline{text-decoration: underline; display: inline;}`+
			`.form-header{display:block; margin:0 0 5rem 0;}`+
			`.form-header-po{display:block; margin:0 0 3.25rem 0;}`+
			`.form-header-ppm{display:block; margin:0 0 5.25rem 0;}`+
			`.form-header-cm{display:block; margin:0 0 7rem 0;}`+
			`.form-header-reloc{display:block; margin:0 0 5.25rem 0;}`+
			`.form-one-header{display:block; margin:0 0 3.25rem 0;}`+
			`.checkbox{margin:0 1rem 0 0;}`+
			`.marginleft{margin:0 0 0 0.07rem;}`+
			`.marginleftminus{margin:0 0 0 -1rem;}`+
			`.marginleftplus{margin:0 0 0 1rem !important;}`+
			`.margintopminus{margin-top:-0.5rem !important;}`+

			`section{ counter-increment: question-counter; text-indent: -17px; text-align: justify; text-justify: inter-word; margin: 0.5rem 0.5rem 0.5rem 1rem;}`+ 
			`section:before {font-weight: bolder; content:counter(question-counter) ".";}`+
			`section.resetquestion{counter-reset: question-counter;}`+
			
			`ol.resetcounter{list-style: none;counter-reset: bracket-counter;}`+
			`ol li.bracketnumber{text-indent: -25px;text-align: justify;text-justify: inter-word;margin:1rem 0;counter-increment: bracket-counter;}`+
			`ol li.bracketnumber:before {content:"(" counter(bracket-counter) ") ";font-weight: bold;}`+
			`ol.resetlist {list-style: none;counter-reset: list-counter;}`+
			`ol li.listnumber{text-indent: -25px;text-align: justify;text-justify: inter-word;margin:1rem 0;counter-increment: list-counter;}`+
			`ol li.listnumber:before {content:counter(list-counter) ". ";font-weight: bold;}`+
			`ol.resetcounteralpha {list-style: none;counter-reset: alpha-counter;}`+
			`ol li.bracketalpha{text-indent: -20px;margin:0.075rem 0;counter-increment: alpha;}`+
			`ol li.bracketalpha:before {content:counter(alpha, lower-alpha)") ";}`+				
			`ol.resetcounterroman {list-style: none;counter-reset: roman-counter;}`+			  
			`ol li.bracketroman {text-indent: -20px;margin:0.25rem 0;counter-increment: roman;}`+
			`ol li.bracketroman:before {content:counter(roman, lower-roman)") ";}`+
						
			`
			body{				
				font-family: BCSans;
			}
			`+
		`</style>
		</head>
		<body>
			
				<div class="container">
					`+html+
		`</div></body></html>`	 
	
	return body
})